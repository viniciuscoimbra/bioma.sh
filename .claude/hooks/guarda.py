#!/usr/bin/env python3
# Casca: o portão mora em .agents/, que não é de fornecedor nenhum.
import os, runpy, sys
runpy.run_path(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__)))), ".agents", "hooks", "guarda.py"), run_name="__main__")
