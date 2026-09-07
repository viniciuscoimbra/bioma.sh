#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""O harness tem o que promete? Um critério por linha.

Cada critério é marcado com o que ele de fato mede:

    [roda]   executa o comportamento e confere a resposta
    [existe] confere presença de arquivo ou de conteúdo

Uma revisão independente de 2026-09-06 disse, com razão, que a versão anterior
era "inventário, não prova": os doze critérios passavam por existência, e todos
podiam passar com o comportamento rompido. Os que dão para executar passaram a
executar. Os que sobraram em `[existe]` continuam sendo presença, e o rótulo
diz isso em vez de esconder.

Não é nota de qualidade. É a resposta a uma pergunta só: o harness continua
inteiro, ou apodreceu calado?

O placar existe porque harness apodrece calado: o hook deixa de estar ligado, a
skill perde o link, o portão sai do CI, e nada avisa. Aqui avisa.

    placar_do_harness.py              imprime o placar
    placar_do_harness.py --exigir N   sai 1 se o placar for menor que N

Saída: 0 medido (ou acima do mínimo) · 1 abaixo do mínimo pedido
"""
import io
import json
import os
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def texto(rel):
    p = os.path.join(RAIZ, rel)
    return io.open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def existe(rel):
    return os.path.exists(os.path.join(RAIZ, rel))


def _roda(*args, **kw):
    """(saiu_zero, saída) de um comando na raiz do repositório."""
    try:
        p = subprocess.run([sys.executable] + list(args), cwd=RAIZ, capture_output=True,
                           text=True, timeout=120, env=dict(os.environ, **kw.get("env", {})))
    except (subprocess.TimeoutExpired, OSError):
        return False, "não rodou"
    return p.returncode == 0, (p.stdout + p.stderr)


def _guarda_recusa(comando):
    """O hook, pela ENTRADA PÚBLICA: o mesmo caminho que o Claude Code usa."""
    try:
        p = subprocess.run([sys.executable, ".agents/hooks/guarda.py"], cwd=RAIZ,
                           input=json.dumps({"tool_name": "Bash",
                                             "tool_input": {"command": comando}}),
                           capture_output=True, text=True, timeout=120)
    except (subprocess.TimeoutExpired, OSError):
        return False
    return p.returncode == 2


def _um_vizinho_por_regra():
    """Cada motivo de recusa tem pelo menos um caso que PASSA ao lado dele.

    A versão anterior conferia dois booleanos por `tipo`, e todas as regras de
    comando compartilham o tipo `acao-sensivel`: bastava um vizinho para o
    critério inteiro. Agora a conta é por MOTIVO, que é por regra.
    """
    sys.path.insert(0, os.path.join(RAIZ, ".agents", "hooks"))
    try:
        import guarda
    except ImportError:
        return False
    caminho = os.path.join(RAIZ, ".agents", "fixtures", "casos.json")
    if not os.path.isfile(caminho):
        return False
    casos = [c for c in json.load(io.open(caminho, encoding="utf-8"))
             if c.get("tipo") == "acao-sensivel"]
    # RODA cada caso, e não só conta: a versão anterior comparava dois números
    # e passava com o guarda recusando tudo (revisão de 2026-09-06, 3a rodada).
    motivos = set()
    for c in casos:
        motivo = guarda.motivo_da_recusa(c["evento"])
        se_recusa = bool(motivo)
        if se_recusa != (c["esperado"] == 2):
            return False
        if se_recusa:
            motivos.add(motivo)
    passam = [c for c in casos if c["esperado"] == 0]
    return bool(motivos) and len(passam) >= len(motivos)


CRITERIOS = [
    ("contrato-versionado", "[existe] O contrato do agente está no repositório",
     lambda: existe("AGENTS.md") and "@AGENTS.md" in texto("CLAUDE.md")),
    ("harness-sem-vendor", "[existe] O harness mora em .agents/ e a casca aponta para lá",
     lambda: existe(".agents/hooks/guarda.py") and ".agents/hooks/guarda.py" in texto(".claude/settings.json")),
    ("portao-de-comando", "[roda] O portão recusa de verdade, pela entrada pública",
     lambda: _guarda_recusa("git add -A") and not _guarda_recusa("git add ferramentas/x.py")),
    ("autoteste-do-portao", "[roda] O autoteste do portão passa",
     lambda: _roda(".agents/hooks/guarda.py", "--autoteste")[0]),
    ("caso-por-regra", "[roda] Cada motivo de recusa tem vizinho que passa",
     lambda: _um_vizinho_por_regra()),
    ("evidencia-cobrada", "[roda] Task fechada sem comando reprova",
     lambda: _roda(".agents/scripts/portao_evidencia.py", "--autoteste")[0]),
    ("prova-no-pr", "[roda] PR sem prova, e PR com seção vazia, reprovam",
     lambda: (not _roda(".agents/scripts/portao_prova.py", env={"PR_BODY": ""})[0]
              and not _roda(".agents/scripts/portao_prova.py",
                            env={"PR_BODY": "## Resumo\n\n## Prova\n"})[0]
              and _roda(".agents/scripts/portao_prova.py",
                        env={"PR_BODY": "## Resumo\nx\n\n## Prova\n`unidade` ok\n"})[0])),
    ("portoes-no-ci", "[existe] Os portões do harness estão no CI",
     lambda: ".agents/scripts/evals_do_harness.py" in texto(".github/workflows/harness.yml")),
    ("portoes-da-arvore-no-ci", "[existe] Os portões do produto estão no CI",
     lambda: "testes/portoes.sh" in texto(".github/workflows/portoes.yml")),
    ("verificacao-cruzada", "[existe] O procedimento de revisão cruzada está escrito",
     lambda: existe(".agents/skills/verificacao-cruzada/SKILL.md")),
    ("portao-do-loop", "[existe] O portão do loop está escrito",
     lambda: existe(".agents/skills/portao-do-loop/SKILL.md")),
    ("as-duas-cascas", "[existe] Claude e Codex leem as mesmas skills",
     lambda: existe(".claude/skills/verificacao-cruzada") and existe(".codex/skills/verificacao-cruzada")),
    ("rotas-do-bio-sob-portao", "[roda] /salvar e /abrir têm portão que reprova",
     lambda: _roda("testes/bio_ida_e_volta.py")[0]),
    ("regua-da-ida-e-volta", "[existe] A régua da regra pétrea existe (ainda é relatório, não portão)",
     lambda: existe("ferramentas/ida_e_volta.py")),
    ("ci-na-branch-certa", "[roda] O CI escuta a branch em que o repositório está",
     lambda: _branch_do_ci()),
]


def _branch_do_ci():
    """O CI escuta a branch em que o repositório está.

    Achado CRÍTICO de 2026-09-06: os dois workflows filtravam `main`, o
    repositório vive em `master`, e `gh run list` devolvia ZERO execuções em
    321 commits. O CI existia no disco e nunca rodou.
    """
    alvo = _branch_alvo()
    if not alvo:
        return False
    fluxos = [f for f in ("harness.yml", "portoes.yml")
              if existe(".github/workflows/" + f)]
    if not fluxos:
        return False
    return all(alvo in texto(".github/workflows/" + f) for f in fluxos)


def _branch_alvo():
    """A branch que o CI PRECISA escutar, e não a que está no disco.

    `git branch --show-current` sai vazio no checkout de pull request, porque
    `actions/checkout` deixa o HEAD destacado: a primeira versão deste critério
    reprovava todo PR válido (revisão de 2026-09-06, terceira rodada). A ordem
    aqui é a que responde em qualquer um dos três lugares onde este comando
    roda: dentro de um PR, dentro de um push, e na máquina de quem trabalha.
    """
    for chave in ("GITHUB_BASE_REF", "GITHUB_REF_NAME"):
        v = (os.environ.get(chave) or "").strip()
        if v:
            return v
    for args in (["symbolic-ref", "--short", "refs/remotes/origin/HEAD"],
                 ["branch", "--show-current"]):
        try:
            p = subprocess.run(["git"] + args, cwd=RAIZ, capture_output=True,
                               text=True, timeout=20)
        except (subprocess.TimeoutExpired, OSError):
            continue
        v = p.stdout.strip().split("/")[-1]
        if p.returncode == 0 and v:
            return v
    return ""


def _dois_lados():
    """Todo tipo de caso tem pelo menos um recusado e um que passa."""
    p = os.path.join(RAIZ, ".agents", "fixtures", "casos.json")
    if not os.path.isfile(p):
        return False
    casos = json.load(io.open(p, encoding="utf-8"))
    por_tipo = {}
    for c in casos:
        t = c.get("tipo")
        if not t:
            continue
        recusa = c.get("esperado") == 2 or c.get("ok") is False
        por_tipo.setdefault(t, set()).add(recusa)
    return bool(por_tipo) and all(len(v) == 2 for v in por_tipo.values())


def main():
    linhas = []
    for ident, rotulo, teste in CRITERIOS:
        try:
            ok = bool(teste())
        except Exception:
            ok = False
        linhas.append((ok, ident, rotulo))
    pontos = sum(1 for ok, _, _ in linhas if ok)
    rodam = sum(1 for ok, _, r in linhas if r.startswith("[roda]"))
    print("placar do harness · %d de %d · %d medem comportamento, %d medem presença"
          % (pontos, len(linhas), rodam, len(linhas) - rodam))
    for ok, ident, rotulo in linhas:
        print("  %s  %-26s %s" % ("ok " if ok else "FALTA", ident, rotulo))
    if "--exigir" in sys.argv:
        minimo = int(sys.argv[sys.argv.index("--exigir") + 1])
        if pontos < minimo:
            print("placar abaixo do mínimo pedido (%d)" % minimo, file=sys.stderr)
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
