---
description: Deploy rápido para Firebase Hosting
---

# Deploy Firebase

Workflow para fazer deploy rápido do projeto para Firebase Hosting.

// turbo-all

## Passos:

1. Iniciar Firebase Emulators em background

```bash
start /B firebase emulators:start --project demo-projeto-estudos
```

2. Aguardar emuladores iniciarem

```bash
timeout /t 15
```

3. Rodar testes E2E

```bash
npm run test:e2e
```

4. Parar emuladores (Ctrl+C no terminal do emulator ou fechar)

5. Build do projeto

```bash
npm run build
```

6. Deploy para Firebase Hosting

```bash
firebase deploy --only hosting
```

## Resultado:

Após o deploy, a aplicação estará disponível em:

- **URL**: https://projeto-estudos-b4fcf.web.app/
- **Console**: https://console.firebase.google.com/project/projeto-estudos-b4fcf/hosting
