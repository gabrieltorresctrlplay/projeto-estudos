# 📚 Documentação do Projeto

## 📖 Guias Principais

- **[LINKS.md](LINKS.md)** - Links úteis do projeto
- **[AUTH.md](AUTH.md)** - Guia de autenticação Firebase
- **[DEPLOY.md](DEPLOY.md)** - Guia de deploy

---

## 📁 Estrutura de Pastas

### 🤖 `sessions/`

Resumos automáticos gerados pela IA ao encerrar sessões de trabalho (`/end`).

**Conteúdo:**

- Resumo das mudanças implementadas
- Arquivos modificados
- Data e hora da sessão
- Próximos passos sugeridos

---

## 🔧 Workflows Disponíveis

Atalhos para automatizar tarefas comuns. A documentação completa está em `.agent/workflows/`.

### `/start` - Iniciar Sessão

- Carrega contexto completo do projeto
- Verifica status do Git
- Lista últimas sessões
- Apresenta resumo do estado atual

### `/deploy` - Deploy Rápido

- Build do projeto
- Deploy para Firebase Hosting
- Auto-execução habilitada

### `/end` - Encerrar Sessão

- Analisa mudanças
- Atualiza documentação
- Cria resumo automático
- Git add + commit + push

---

**Estrutura da documentação organizada para fácil acesso.**

**Última atualização**: 13/12/2025
