---
trigger: always_on
---

# Regras para Gemini AI

## 1. Context7

- **SEMPRE** use o MCP Context7 para consultar documentação de bibliotecas e frameworks.
- Use Context7 para garantir versões atualizadas e melhores práticas.

## 2. Documentação do Projeto

Mantenha a documentação **SEMPRE ATUALIZADA** seguindo esta estrutura:

### 📘 README.md (raiz)

**Propósito:** "Visão Geral e Guia de Início Rápido"

**Deve conter:**

- ✅ Stack tecnológica atual (versões)
- ✅ Status do projeto (o que está pronto)
- ✅ Estrutura de arquivos atualizada
- ✅ Scripts disponíveis
- ✅ Exemplos de código básicos
- ✅ Como usar (quick start)
- ✅ Estatísticas (pacotes, build size)

**Atualizar quando:**

- Adicionar/remover dependências
- Mudar estrutura de pastas
- Adicionar novos scripts
- Implementar features principais
- Mudar configurações importantes

### 📚 docs/ (pasta de documentação)

**Propósito:** "Guias Detalhados e Referências Técnicas"

**Deve conter:**

- ✅ Guias específicos (AUTH.md, DEPLOY.md, etc)
- ✅ Links úteis (LINKS.md)
- ✅ Setup detalhado (SETUP.md)
- ✅ Contextos/histórico (docs/contextos/)

**Atualizar quando:**

- Adicionar novos serviços (criar novo .md)
- Mudar processo de deploy
- Adicionar novos links importantes
- Implementar novas features que precisam de guia

### 🎯 Regra de Ouro

**SEMPRE que fizer mudanças significativas no código:**

1. Atualize o README.md se afetar a visão geral
2. Atualize/crie arquivos em docs/ se precisar de tutorial
3. Mantenha a data de "Última atualização" nos arquivos

**Mudanças significativas incluem:**

- Adicionar/remover dependências principais
- Mudar estrutura de pastas
- Adicionar novos serviços (Firebase, APIs, etc)
- Implementar features principais
- Mudar configurações de build/deploy
  2 - C:\Users\delci\projeto-estudos\docs
