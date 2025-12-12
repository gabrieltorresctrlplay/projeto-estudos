# 🚀 Guia de Deploy Firebase

## 📋 Pré-requisitos

- Node.js instalado
- Conta Google/Firebase
- Projeto Firebase criado (projeto-estudos-b4fcf)

## 🔧 Passo 1: Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

## 🔑 Passo 2: Autenticar no Firebase

```bash
firebase login
```

Isso abrirá o navegador para você fazer login com sua conta Google.

## 🎯 Passo 3: Inicializar Firebase no Projeto

```bash
firebase init
```

**Seleções durante o init:**

1. ❓ **Which Firebase features?** → Selecione:
   - ✅ Hosting
   - ✅ Firestore (se ainda não configurado)
2. ❓ **Use an existing project?** → Yes
3. ❓ **Select a project** → `projeto-estudos-b4fcf`
4. ❓ **What do you want to use as your public directory?** → `dist`
5. ❓ **Configure as a single-page app?** → **Yes**
6. ❓ **Set up automatic builds and deploys with GitHub?** → No (por enquanto)
7. ❓ **File dist/index.html already exists. Overwrite?** → **No**

## 🏗️ Passo 4: Build do Projeto

```bash
npm run build
```

Isso cria a pasta `dist/` com os arquivos otimizados.

## 🚀 Passo 5: Deploy

```bash
npm run deploy
```

Ou manualmente:

```bash
firebase deploy --only hosting
```

## ✅ Verificar Deploy

Após o deploy, você receberá uma URL:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/projeto-estudos-b4fcf/overview
Hosting URL: https://projeto-estudos-b4fcf.web.app
```

## 🔄 Comandos Úteis

```bash
# Ver projetos Firebase
firebase projects:list

# Selecionar projeto
firebase use projeto-estudos-b4fcf

# Preview local da build
npm run preview

# Deploy rápido
npm run deploy

# Ver logs
firebase hosting:channel:list
```

## 🛠️ Troubleshooting

### Erro: "Not authorized"

```bash
firebase logout
firebase login
```

### Erro: "No project active"

```bash
firebase use --add
# Selecione seu projeto
```

### Build com erro

```bash
# Limpar cache
rm -rf node_modules dist
npm install
npm run build
```

## 📝 Workflow Recomendado

```bash
# 1. Desenvolver
npm run dev

# 2. Testar build local
npm run build
npm run preview

# 3. Deploy
npm run deploy
```

---

**Última atualização**: 12/12/2025
