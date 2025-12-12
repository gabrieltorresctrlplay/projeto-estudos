---
description: Iniciar nova sessão - Carregar contexto do projeto
---

# Start Session Workflow

Workflow para iniciar uma nova sessão de trabalho, carregando todo o contexto do projeto.

// turbo-all

## Passos:

1. Ler documentação principal

```bash
cat README.md
```

2. Verificar status do Git

```bash
git status
```

3. Listar últimas sessões

```bash
ls -la docs/sessions/
```

4. Verificar dependências atuais

```bash
cat package.json
```

5. Listar estrutura do projeto

```bash
tree /F /A src
```

## O que a IA deve fazer:

Após executar os comandos, a IA deve:

1. **Ler e resumir**:
   - Stack tecnológica atual
   - Últimas mudanças (git status)
   - Última sessão de trabalho (docs/sessions/)
2. **Apresentar contexto**:
   - "Bem-vindo de volta! 👋"
   - Resumo do estado atual do projeto
   - Últimas features implementadas
   - Sugestões de próximos passos

3. **Perguntar**:
   - "O que você quer fazer hoje?"
   - Oferecer opções baseadas no contexto

## Resultado:

- ✅ Contexto completo carregado
- ✅ IA atualizada sobre o projeto
- ✅ Pronto para continuar de onde parou

---

**Use `/start` no início de cada nova conversa!** 🎯
