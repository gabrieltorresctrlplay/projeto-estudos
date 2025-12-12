---
description: Encerrar sessão - Salvar tudo no Git
---

# End Session Workflow

Workflow completo para encerrar uma sessão de trabalho, atualizando documentação e salvando tudo no Git.

// turbo-all

## Passos:

1. Verificar mudanças no projeto

```bash
git status
```

2. Analisar package.json para ver dependências atuais

```bash
cat package.json
```

3. Listar estrutura de arquivos

```bash
tree /F /A
```

4. Adicionar todas as mudanças ao Git

```bash
git add .
```

5. Criar commit com mensagem descritiva

```bash
git commit -m "docs: atualização automática - sessão encerrada"
```

6. Enviar para o repositório remoto (branch main)

```bash
git push origin main
```

## Notas:

- A IA irá atualizar README.md e docs/ antes do commit
- Um resumo da sessão será criado em docs/sessions/
- Todas as mudanças serão commitadas automaticamente
- Push será feito para a branch main

## Resultado:

- ✅ Documentação atualizada
- ✅ Resumo da sessão salvo
- ✅ Código commitado
- ✅ Push enviado ao GitHub
