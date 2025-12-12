# 🔧 Workflows Disponíveis

Workflows são atalhos para automatizar tarefas comuns no projeto.

## 📋 Lista de Workflows

### 🎬 `/start`

**Descrição:** Iniciar nova sessão - Carregar contexto do projeto

**O que faz:**

1. ✅ Lê documentação principal (README.md)
2. ✅ Verifica status do Git
3. ✅ Lista últimas sessões de trabalho
4. ✅ Carrega dependências atuais
5. ✅ Apresenta resumo do projeto

**Quando usar:**

- No início de cada nova conversa
- Quando voltar ao projeto depois de um tempo
- Para relembrar o contexto atual

**Resultado:**

- Contexto completo carregado
- Resumo do estado atual
- Sugestões de próximos passos

---

### 🚀 `/deploy`

**Descrição:** Deploy rápido para Firebase Hosting

**O que faz:**

1. ✅ Build do projeto (`npm run build`)
2. ✅ Deploy para Firebase Hosting (`firebase deploy --only hosting`)

**Quando usar:**

- Após implementar novas features
- Para atualizar a versão em produção
- Testar mudanças no ambiente live

**Resultado:**

- URL: https://projeto-estudos-b4fcf.web.app/
- Console: https://console.firebase.google.com/project/projeto-estudos-b4fcf/hosting

---

### 💾 `/end`

**Descrição:** Encerrar sessão de trabalho (salvar tudo)

**O que faz:**

1. ✅ Analisa mudanças no projeto (`git status`)
2. ✅ Atualiza documentação (README.md e docs/)
3. ✅ Cria resumo da sessão em `docs/sessions/`
4. ✅ Commit automático (`git add . && git commit`)
5. ✅ Push para GitHub (`git push`)

**Quando usar:**

- Ao finalizar uma sessão de desenvolvimento
- Antes de fechar o projeto
- Para garantir que tudo está salvo e documentado

**Resultado:**

- Código commitado e enviado ao GitHub
- Documentação atualizada
- Resumo da sessão salvo

---

## 🎯 Como Usar

Basta digitar o comando do workflow no chat:

```
/start
```

ou

```
/deploy
```

ou

```
/end
```

A IA executará todos os passos automaticamente! 🤖

---

## 📁 Localização dos Workflows

Os workflows estão salvos em:

```
.agent/workflows/
├── start.md
├── deploy.md
└── end.md
```

---

**Última atualização**: 12/12/2025
