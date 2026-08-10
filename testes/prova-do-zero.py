#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""O caminho que o produto promete, do zero, clicando.

Sem documento, sem imagem, sem .bio: começar do zero, passar pelo assistente,
buscar recurso, ligar peça em peça, ver o código nascer e levar para a máquina.
Cada passo mede alguma coisa.
"""
import json
import os
import sys
from playwright.sync_api import sync_playwright

PORTA = os.environ.get("PORTA", "8741")
BASE = "http://localhost:%s" % PORTA
S = os.path.dirname(os.path.abspath(__file__))
DESTINO = "/tmp/bioma-do-zero"
placar = []


def diz(ok, item, nota=""):
    placar.append((bool(ok), item, nota))
    print(("PASS  " if ok else "FALHA ") + item + (("  · " + str(nota)) if nota else ""))


def poe(pg, termo, esperado):
    """Abre a busca (se já não estiver aberta), digita e põe o primeiro achado."""
    if not pg.locator(".pk-fundo").count():
        pg.locator(".pr-buscar").first.click()
        pg.wait_for_timeout(700)
    pg.locator(".pk-entrada, .pk-fundo input").first.fill(termo)
    pg.wait_for_timeout(1400)
    itens = pg.locator(".pk-linha")
    if not itens.count():
        pg.screenshot(path=os.path.join(S, "zero-busca-%s.png" % termo))
        diz(False, "a busca acha %r" % termo, "nenhum resultado")
        pg.keyboard.press("Escape")
        return False
    rotulo = itens.first.inner_text().replace("\n", " ")[:40]
    itens.first.click()
    pg.wait_for_timeout(1500)
    n = pg.locator(".bc-no").count()
    diz(n == esperado, "busca %r e põe no canvas" % termo,
        "%d peças · escolhido: %s" % (n, rotulo))
    return n == esperado


def main():
    with sync_playwright() as p:
        nav = p.chromium.launch()
        pg = nav.new_page(viewport={"width": 1500, "height": 950})
        erros = []
        pg.on("pageerror", lambda e: erros.append(str(e)))

        pg.goto(BASE + "/", wait_until="domcontentloaded")
        pg.wait_for_timeout(2500)
        diz(pg.locator(".bc-no").count() == 0, "a tela abre vazia")

        pg.get_by_text("Start from zero").click()
        pg.wait_for_timeout(1200)
        tem_wizard = pg.locator(".wz-fundo").count() == 1
        diz(tem_wizard, "começar do zero abre o assistente do projeto")

        if tem_wizard:
            # quem só quer desenhar usa o "configurar depois"; é o caminho curto
            depois = pg.get_by_text("Configure later")
            if depois.count():
                depois.first.click()
                pg.wait_for_timeout(1500)
                diz(pg.locator(".wz-fundo").count() == 0,
                    "dá para pular o assistente e ir desenhar")
            else:
                campos = pg.locator(".wz input:visible")
                for i, v in enumerate(["acme", "do-zero", "AC"][:campos.count()]):
                    campos.nth(i).fill(v)
                pg.get_by_role("button", name="Next").click()
                pg.wait_for_timeout(700)
                pg.get_by_role("button", name="Next").click()
                pg.wait_for_timeout(700)
                pg.get_by_role("button", name="Finish").click()
                pg.wait_for_timeout(1500)
                diz(pg.locator(".wz-fundo").count() == 0,
                    "o assistente conclui e libera o canvas")

        pg.screenshot(path=os.path.join(S, "zero-1-canvas.png"))

        if not (poe(pg, "s3", 1) and poe(pg, "lambda", 2)):
            nav.close()
            return 1

        # ligar peça em peça pelo pino
        o = pg.locator(".bc-no").first.locator(".bc-pino.saida")
        d = pg.locator(".bc-no").nth(1).locator(".bc-pino.entrada")
        a, b = o.bounding_box(), d.bounding_box()
        pg.mouse.move(a["x"] + a["width"] / 2, a["y"] + a["height"] / 2)
        pg.mouse.down()
        pg.mouse.move(b["x"] + b["width"] / 2, b["y"] + b["height"] / 2, steps=15)
        pg.mouse.up()
        pg.wait_for_timeout(2500)
        fios = pg.locator(".bc-fios path").count()
        diz(fios > 0, "ligar peça em peça desenha a seta", "%d traços" % fios)

        pg.wait_for_timeout(2500)
        pg.screenshot(path=os.path.join(S, "zero-2-ligado.png"))

        # o código nasce enquanto se monta
        pg.locator(".barra-comando button").first.click()
        pg.wait_for_timeout(2500)
        arqs = pg.locator(".gc-arquivo").count()
        diz(arqs > 0, "a gaveta mostra a árvore gerada", "%d arquivos" % arqs)
        if arqs:
            try:
                pg.locator(".gc-arquivo").first.click(force=True, timeout=8000)
                pg.wait_for_timeout(900)
            except Exception as e:
                diz(False, "clicar no arquivo da árvore", str(e).splitlines()[0][:70])
            txt = pg.locator(".gc-codigo, .gc-linha, pre, code").first.inner_text()[:300]
            diz(bool(txt.strip()), "o painel mostra o código do arquivo",
                (txt.splitlines() or [""])[0][:70])
        pg.screenshot(path=os.path.join(S, "zero-3-codigo.png"))

        # levar para a máquina
        os.system("rm -rf " + DESTINO)
        r = pg.evaluate("""async (destino) => {
            const g = window.__bioma_grafo || null
            const r = await fetch('/materializar', { method: 'POST',
                body: JSON.stringify({ destino, grafo: g }) })
            return await r.json()
        }""", DESTINO)
        if r.get("erro"):
            # a tela tem botão próprio; tenta por ele
            botao = pg.get_by_text("Take to my machine")
            if botao.count():
                botao.first.click()
                pg.wait_for_timeout(2000)
                pg.screenshot(path=os.path.join(S, "zero-4-levar.png"))
                diz(False, "levar para a máquina pela rota", r.get("erro"))
            else:
                diz(False, "levar para a máquina", r.get("erro"))
        else:
            diz(bool(r.get("quantos")), "levar para a máquina grava a árvore",
                "%s arquivos" % r.get("quantos"))

        diz(not erros, "nenhum erro de página", erros[:1])
        nav.close()

    print("\n%d de %d passos" % (sum(1 for ok, _, _ in placar if ok), len(placar)))
    return 0 if all(ok for ok, _, _ in placar) else 1


if __name__ == "__main__":
    sys.exit(main())
