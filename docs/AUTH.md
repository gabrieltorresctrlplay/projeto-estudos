# 🔐 Guia de Autenticação Firebase

Guia conciso para implementar autenticação Firebase no projeto.

---

## 📋 Configuração no Console Firebase

### 1. Ativar Métodos de Autenticação

**Link:** https://console.firebase.google.com/project/projeto-estudos-b4fcf/authentication

**Email/Senha:**

- Clique em "Email/Password" → Enable → Salvar

**Google Sign-In:**

- Clique em "Google" → Enable → Selecione email de suporte → Salvar

### 2. Domínios Autorizados

Em "Settings" → "Authorized domains", adicione:

- `localhost` (já vem por padrão)
- `projeto-estudos-b4fcf.web.app`

---

## 💻 API de Autenticação

O projeto possui serviços prontos em [`src/lib/auth.ts`](file:///c:/Users/gabri/Desktop/oiee/src/lib/auth.ts).

### Métodos Disponíveis

```typescript
import { authService } from '@/lib'

// Criar conta
await authService.signUpWithEmail(email, password)

// Login com email
await authService.signInWithEmail(email, password)

// Login com Google
await authService.signInWithGoogle()

// Logout
await authService.signOut()

// Verificar usuário atual
authService.getCurrentUser()

// Observer de mudanças
authService.onAuthStateChanged(callback)
```

### Exemplo: Login Component

Veja implementação completa em:

- [`src/pages/auth/Login.tsx`](file:///c:/Users/gabri/Desktop/oiee/src/pages/auth/Login.tsx)
- [`src/pages/auth/Register.tsx`](file:///c:/Users/gabri/Desktop/oiee/src/pages/auth/Register.tsx)

---

## 🛡️ Rotas Protegidas

O projeto possui componentes de proteção de rotas:

**ProtectedRoute** - Apenas usuários autenticados:

```typescript
// Ver: src/components/auth/ProtectedRoute.tsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

**PublicOnlyRoute** - Apenas visitantes (redireciona autenticados):

```typescript
// Ver: src/components/auth/PublicOnlyRoute.tsx
<Route path="/login" element={
  <PublicOnlyRoute>
    <Login />
  </PublicOnlyRoute>
} />
```

---

## 📊 Integração com Firestore

### Salvar Dados do Usuário

```typescript
import { firestoreService } from '@/lib'

// Criar perfil após registro
await firestoreService.addDocument('users', {
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  createdAt: new Date().toISOString(),
})
```

### Buscar Dados

```typescript
import { firestoreService, where } from '@/lib'

// Buscar por UID
const { data } = await firestoreService.getDocuments('users', where('uid', '==', userId))
```

**API completa:** [`src/lib/firestore.ts`](file:///c:/Users/gabri/Desktop/oiee/src/lib/firestore.ts)

---

## 🔒 Regras de Segurança

**Arquivo:** [`firestore.rules`](file:///c:/Users/gabri/Desktop/oiee/firestore.rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**⚠️ IMPORTANTE:** Regras atuais expiram em 10/01/2026. Configure regras de produção antes!

---

## ⚠️ Tratamento de Erros

Principais erros e mensagens:

| Código                      | Mensagem                              |
| --------------------------- | ------------------------------------- |
| `auth/email-already-in-use` | Este email já está em uso             |
| `auth/invalid-email`        | Email inválido                        |
| `auth/weak-password`        | Senha muito fraca (mín. 6 caracteres) |
| `auth/user-not-found`       | Usuário não encontrado                |
| `auth/wrong-password`       | Senha incorreta                       |
| `auth/popup-closed-by-user` | Login cancelado                       |

**Implementação:** Ver tratamento de erros em [`Login.tsx`](file:///c:/Users/gabri/Desktop/oiee/src/pages/auth/Login.tsx) e [`Register.tsx`](file:///c:/Users/gabri/Desktop/oiee/src/pages/auth/Register.tsx)

---

## 📝 Checklist

- [x] Email/Password ativado no Console
- [x] Google Sign-In ativado no Console
- [x] Domínios autorizados configurados
- [x] Regras de segurança Firestore (⚠️ temporárias)
- [x] Páginas de Login/Register criadas
- [x] Rotas protegidas implementadas
- [ ] Testes em produção

---

## 🔗 Links Úteis

- [Console Firebase Auth](https://console.firebase.google.com/project/projeto-estudos-b4fcf/authentication)
- [Firestore Rules](https://console.firebase.google.com/project/projeto-estudos-b4fcf/firestore/rules)
- [Documentação Firebase Auth](https://firebase.google.com/docs/auth)

---

**Última atualização**: 13/12/2025
