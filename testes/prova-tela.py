#!/usr/bin/env python3
"""A prova da tela: o caminho que precisa funcionar, no navegador.

Não é teste de unidade. É a resposta à pergunta "isso ainda funciona para
quem usa?", feita clicando. Cada verificação mede alguma coisa (contagem,
texto, código de saída), porque foto tirada e não olhada não prova nada.

O servidor precisa estar no ar. O portão `testes/portoes.sh` sobe e derruba
sozinho; à mão:

  PORTA=8731 python3 tela/servidor.py &
  PORTA=8731 python3 testes/prova-tela.py
"""
import os
import pathlib
import sys

from playwright.sync_api import sync_playwright

PORTA = os.environ.get("PORTA", "8000")
BASE = "http://localhost:%s" % PORTA
FOTOS = pathlib.Path(os.environ.get("FOTOS", "/tmp/bioma-prova"))
FOTOS.mkdir(parents=True, exist_ok=True)

placar = []


def diz(ok, item, nota=""):
    placar.append((bool(ok), item, nota))
    print(("PASS  " if ok else "FAIL  ") + item + (("  · " + str(nota)) if nota else ""))


def prova(pg):
    erros = []
    pg.on("pageerror", lambda e: erros.append(str(e)))

    # ── a tela abre e o exemplo carrega ──────────────────────────────────
    pg.goto(BASE + "/?exemplo=1", wait_until="domcontentloaded")
    pg.wait_for_selector(".bc-no", timeout=60000)
    pg.wait_for_timeout(4000)
    pecas = pg.locator(".bc-no").count()
    diz(pecas >= 6, "o exemplo põe as peças no canvas", "%d peças" % pecas)
    diz(not erros, "nenhum erro de página", erros[:1])

    caixas = pg.locator(".bc-conta-nome").count()
    diz(caixas >= 2, "as contas viram caixas rotuladas", "%d caixas" % caixas)
    rotulo = pg.locator(".bc-conta-nome").first.inner_text()
    diz("(" in rotulo, "a caixa mostra apelido e número", rotulo.strip()[:40])

    # ── o inspetor: clicar numa peça abre a ficha dela ───────────────────
    pg.locator(".bc-no").first.click()
    pg.wait_for_timeout(900)
    diz(pg.locator(".celula").count() == 1, "clicar na peça abre a ficha no inspetor")
    diz(pg.locator("#celula-campo-conta").count() == 1, "a conta é escolha entre as cadastradas")

    # ── as abas do inspetor respondem ao clique ──────────────────────────
    pg.locator(".pd-abas button").filter(has_text="Decis").or_(
        pg.locator(".pd-abas button").filter(has_text="Decisions")).first.click()
    # esperar pelo que se quer ver, e não por um relógio: com nove peças no
    # exemplo o painel leva mais que os 600ms que estavam aqui, e a prova
    # reprovava por lentidão, que é ruído e não defeito
    try:
        pg.wait_for_selector(".pd-cartao", timeout=8000)
    except Exception:
        pass
    diz(pg.locator(".pd-cartao").count() > 0, "a aba de decisões mostra o que o bioma decidiu")
    pg.locator(".pd-abas button").first.click()
    pg.wait_for_timeout(400)

    # ── desselecionar clicando no vazio ──────────────────────────────────
    pg.locator(".bc-quadro").click(position={"x": 60, "y": 640})
    pg.wait_for_timeout(500)
    diz(pg.locator(".celula").count() == 0, "clicar no vazio desseleciona a peça")

    # ── o código gerado abre, e a árvore navega ──────────────────────────
    pg.locator(".barra-comando button").first.click()
    pg.wait_for_timeout(1400)
    arquivos = pg.locator(".gc-arquivo").count()
    diz(arquivos > 10, "a gaveta do código mostra a árvore", "%d arquivos" % arquivos)
    pastas = pg.locator(".gc-pasta").count()
    if pastas:
        pg.locator(".gc-pasta").first.click()
        pg.wait_for_timeout(500)
        depois = pg.locator(".gc-arquivo").count()
        diz(depois < arquivos, "as pastas abrem e fecham", "%d → %d" % (arquivos, depois))
        pg.locator(".gc-pasta").first.click()
        pg.wait_for_timeout(300)
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(500)

    # ── a busca de recurso abre agrupada por serviço ─────────────────────
    # pelo botão, e não pelo atalho: navegador sem janela não entrega cmd+K
    pg.locator(".pr-buscar").click()
    pg.wait_for_selector(".pk", timeout=15000)
    # o inventário são 274 serviços, e ele chega depois da paleta abrir:
    # esperar o primeiro grupo em vez de um tempo fixo
    pg.wait_for_selector(".pk-grupo", timeout=20000)
    grupos = pg.locator(".pk-grupo").count()
    diz(grupos > 50, "a busca mostra o inventário por serviço", "%d serviços" % grupos)
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(400)

    # ── o comando aparece por inteiro ────────────────────────────────────
    comando = pg.locator(".bcm-comando").inner_text()
    diz(comando.startswith("./bioma.sh"), "o comando aparece por inteiro", comando[:50])

    # ── as duas línguas ──────────────────────────────────────────────────
    pg.locator(".cab-lingua-opcao", has_text="PT").click()
    pg.wait_for_timeout(700)
    diz("Configurações" in pg.locator("header.cab").inner_text(), "a tela troca para português")
    pg.locator(".cab-lingua-opcao", has_text="EN").click()
    pg.wait_for_timeout(700)
    diz("Settings" in pg.locator("header.cab").inner_text(), "e volta para inglês")

    pg.screenshot(path=str(FOTOS / "tela.png"), full_page=False)
    diz(not erros, "nenhum erro de página no caminho inteiro", erros[:1])


def main():
    with sync_playwright() as p:
        nav = p.chromium.launch()
        pg = nav.new_page(viewport={"width": 1680, "height": 1050})
        try:
            prova(pg)
        finally:
            nav.close()

    print("\n===== PLACAR =====")
    falhas = [i for ok, i, _ in placar if not ok]
    print("%d/%d passaram" % (len(placar) - len(falhas), len(placar)))
    print("foto em %s" % (FOTOS / "tela.png"))
    # o código de saída é o que faz esta prova servir de portão: sem ele, o CI
    # lê "FAIL" na tela e segue em frente
    if falhas:
        print("\nreprovado em: " + ", ".join(falhas))
    sys.exit(1 if falhas else 0)


if __name__ == "__main__":
    main()
