#!/usr/bin/env python3
"""Confere que a classificação da célula combina com a proteção dos átomos.

Classificar é por célula (campo `durabilidade` do contrato), proteger é por
átomo (`prevent_destroy` na receita). As duas coisas divergem em silêncio, e
foi assim que o produto de dado do domínio ficou declarado descartável
guardando um balde com conteúdo.

Sai 2 quando não tem insumo para decidir (sem `inventario.json` na raiz). Quem
chama trata 2 como "não se aplica", nunca como aprovação. BIOMA_RAIZ e
BIOMA_CATALOGO apontam a árvore quando ela não é a deste repositório (a que a
tela gera, por exemplo).

Reprova (exit 1):
  DECLARACAO-SEM-EFEITO   permanente sem nenhum átomo com prevent_destroy
  CLASSIFICACAO-ERRADA    efemera com átomo protegido por prevent_destroy
  ATOMO-DESPROTEGIDO      permanente com átomo de conteúdo sem trava

Átomo de conteúdo é o que guarda o que não volta por receita: balde, banco,
tabela, tópico, cofre, chave e vault de cópia de segurança.

Uso: python3 ferramentas/verificar_durabilidade.py
"""
import io, json, os, re, sys

RAIZ = os.environ.get("BIOMA_RAIZ") or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOGO = os.environ.get("BIOMA_CATALOGO") or os.path.join(RAIZ, "infra", "catalogo")

# tipos de recurso que guardam conteúdo que não volta por receita
GUARDA_CONTEUDO = re.compile(
    r'resource\s+"(aws_s3_bucket|aws_rds_cluster|aws_db_instance|aws_dynamodb_table|'
    r'aws_kms_key|aws_kms_replica_key|aws_secretsmanager_secret|kafka_topic|'
    r'aws_glue_registry|aws_glue_catalog_database|aws_backup_vault|aws_msk_cluster|'
    r'aws_qldb_ledger)"\s+"([a-z0-9_]+)"'
)


def atomos_da_receita(pasta, visitadas=None):
    """(atomos_de_conteudo, atomos_com_trava) da receita e das que ela compõe.

    Organismo que compõe molécula herda os átomos dela: a trava do banco mora
    na molécula `banco-aurora`, e o organismo que a usa está protegido por ela.
    """
    visitadas = visitadas if visitadas is not None else set()
    real = os.path.realpath(pasta)
    if real in visitadas:
        return set(), set()
    visitadas.add(real)
    conteudo, travados = set(), set()
    for arq in sorted(os.listdir(pasta)):
        if not arq.endswith(".tf"):
            continue
        txt = io.open(os.path.join(pasta, arq), encoding="utf-8").read()
        for tipo, nome in GUARDA_CONTEUDO.findall(txt):
            conteudo.add("%s.%s" % (tipo, nome))
        # bloco de recurso inteiro, para achar prevent_destroy dentro dele
        for m in re.finditer(r'resource\s+"([a-z0-9_]+)"\s+"([a-z0-9_]+)"\s*\{', txt):
            ini = m.end()
            nivel, i = 1, ini
            while i < len(txt) and nivel:
                if txt[i] == "{":
                    nivel += 1
                elif txt[i] == "}":
                    nivel -= 1
                i += 1
            if "prevent_destroy = true" in txt[ini:i]:
                travados.add("%s.%s" % (m.group(1), m.group(2)))
        # desce nas moléculas compostas por esta receita
        for src in re.findall(r'module\s+"[a-z0-9_]+"\s*\{[^}]*?source\s*=\s*"([^"]+)"', txt, re.S):
            alvo = os.path.normpath(os.path.join(pasta, src))
            if os.path.isdir(alvo):
                c, t = atomos_da_receita(alvo, visitadas)
                conteudo |= c
                travados |= t
    return conteudo, travados


def main():
    # Sem insumo não é reprovação, e muito menos traceback: quem recebe só a
    # árvore pode não ter o inventário, e estourar aqui barrava a execução com
    # uma pilha de Python no lugar de uma frase.
    caminho_inv = os.path.join(RAIZ, "inventario.json")
    if not os.path.exists(caminho_inv):
        print("sem insumo para decidir: %s não existe. Durabilidade confronta a "
              "classificação da célula com a trava dos átomos, e a trava mora no "
              "inventário da instância." % caminho_inv)
        sys.exit(2)
    inv = json.load(io.open(caminho_inv, encoding="utf-8"))
    problemas, linhas = [], []

    for fam, itens in inv["organismos"].items():
        for o in itens:
            chave = "%s/%s" % (fam, o["nome"])
            pasta = os.path.join(CATALOGO, "organismos", fam, o["nome"])
            if not os.path.isdir(pasta):
                continue
            tem_recurso = any(
                'resource "' in io.open(os.path.join(pasta, a), encoding="utf-8").read()
                for a in os.listdir(pasta) if a.endswith(".tf"))
            if not tem_recurso and not any(
                    'module "' in io.open(os.path.join(pasta, a), encoding="utf-8").read()
                    for a in os.listdir(pasta) if a.endswith(".tf")):
                continue  # contrato ainda sem interior (vendor pendente)
            dur = o.get("durabilidade")
            conteudo, travados = atomos_da_receita(pasta)

            if dur == "permanente" and not travados:
                problemas.append("DECLARACAO-SEM-EFEITO %s (nenhum átomo com prevent_destroy)" % chave)
            if dur == "efemera" and travados:
                problemas.append("CLASSIFICACAO-ERRADA %s (efemera guardando %s)"
                                 % (chave, ", ".join(sorted(travados))))
            if dur == "permanente":
                soltos = conteudo - travados
                if soltos:
                    problemas.append("ATOMO-DESPROTEGIDO %s (%s)" % (chave, ", ".join(sorted(soltos))))
            linhas.append("| %s | %s | %d | %d |" % (chave, dur, len(conteudo), len(travados)))

    print("Receitas conferidas: %d · problemas: %d" % (len(linhas), len(problemas)))
    for p in problemas:
        print("  " + p)
    sys.exit(1 if problemas else 0)


if __name__ == "__main__":
    main()
