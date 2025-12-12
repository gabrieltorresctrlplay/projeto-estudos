---
description: Deploy rápido para Firebase Hosting
---

# Deploy Firebase

Workflow para fazer deploy rápido do projeto para Firebase Hosting.

// turbo-all

## Passos:

1. Build do projeto

```bash
npm run build
```

2. Deploy para Firebase Hosting

```bash
firebase deploy --only hosting
```

## Resultado:

Após o deploy, a aplicação estará disponível em:

- **URL**: https://projeto-estudos-b4fcf.web.app/
- **Console**: https://console.firebase.google.com/project/projeto-estudos-b4fcf/hosting
