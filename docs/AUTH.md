# 🔐 Guia de Autenticação Firebase

## 📋 Configuração Inicial no Console Firebase

### 1. Ativar Métodos de Autenticação

1. Acesse: https://console.firebase.google.com/project/projeto-estudos-b4fcf/authentication
2. Clique em **"Get Started"** (se primeira vez)
3. Vá em **"Sign-in method"**

#### Email/Senha

1. Clique em **"Email/Password"**
2. **Enable** → Ativar
3. Salvar

#### Google Sign-In

1. Clique em **"Google"**
2. **Enable** → Ativar
3. **Project support email** → Selecione seu email
4. Salvar

### 2. Configurar Domínios Autorizados

1. Em **"Settings"** → **"Authorized domains"**
2. Adicione seus domínios:
   - `localhost` (já vem por padrão)
   - `projeto-estudos-b4fcf.web.app` (após deploy)
   - Seu domínio customizado (se tiver)

---

## 💻 Usando Autenticação no Código

### Importar Serviços

```typescript
import { authService } from '@/lib'
```

### 1. Criar Conta (Email/Senha)

```typescript
const handleSignUp = async (email: string, password: string) => {
  const { user, error } = await authService.signUpWithEmail(email, password)

  if (error) {
    console.error('Erro ao criar conta:', error.message)
    return
  }

  console.log('Conta criada!', user)
  // Redirecionar para dashboard, etc
}
```

### 2. Login (Email/Senha)

```typescript
const handleSignIn = async (email: string, password: string) => {
  const { user, error } = await authService.signInWithEmail(email, password)

  if (error) {
    console.error('Erro ao fazer login:', error.message)
    return
  }

  console.log('Login realizado!', user)
}
```

### 3. Login com Google

```typescript
const handleGoogleSignIn = async () => {
  const { user, error } = await authService.signInWithGoogle()

  if (error) {
    console.error('Erro no login Google:', error.message)
    return
  }

  console.log('Login Google realizado!', user)
}
```

### 4. Logout

```typescript
const handleSignOut = async () => {
  const { error } = await authService.signOut()

  if (error) {
    console.error('Erro ao fazer logout:', error.message)
    return
  }

  console.log('Logout realizado!')
  // Redirecionar para login
}
```

### 5. Verificar Usuário Logado

```typescript
import { useEffect, useState } from 'react'
import { authService } from '@/lib'
import type { User } from 'firebase/auth'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Observer de autenticação
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    // Cleanup
    return () => unsubscribe()
  }, [])

  if (loading) {
    return <div>Carregando...</div>
  }

  if (!user) {
    return <LoginPage />
  }

  return <Dashboard user={user} />
}
```

---

## 🛡️ Proteger Rotas

### Exemplo com React Router

```typescript
import { Navigate } from 'react-router-dom'
import { authService } from '@/lib'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = authService.getCurrentUser()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Uso
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

---

## 📊 Firestore com Autenticação

### Salvar Dados do Usuário

```typescript
import { firestoreService } from '@/lib'

const saveUserProfile = async (user: User) => {
  const { error } = await firestoreService.addDocument('users', {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: new Date().toISOString(),
  })

  if (error) {
    console.error('Erro ao salvar perfil:', error)
  }
}
```

### Buscar Dados do Usuário

```typescript
import { firestoreService, where } from '@/lib'

const getUserProfile = async (uid: string) => {
  const { data, error } = await firestoreService.getDocuments('users', where('uid', '==', uid))

  if (error) {
    console.error('Erro ao buscar perfil:', error)
    return null
  }

  return data?.[0] || null
}
```

---

## 🔒 Regras de Segurança Firestore

Configure em: https://console.firebase.google.com/project/projeto-estudos-b4fcf/firestore/rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita apenas para usuários autenticados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Coleção pública (apenas leitura)
    match /public/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## ⚠️ Tratamento de Erros Comuns

```typescript
const handleAuthError = (error: Error) => {
  const errorCode = (error as any).code

  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Este email já está em uso'
    case 'auth/invalid-email':
      return 'Email inválido'
    case 'auth/weak-password':
      return 'Senha muito fraca (mínimo 6 caracteres)'
    case 'auth/user-not-found':
      return 'Usuário não encontrado'
    case 'auth/wrong-password':
      return 'Senha incorreta'
    case 'auth/popup-closed-by-user':
      return 'Login cancelado'
    default:
      return 'Erro ao autenticar. Tente novamente.'
  }
}
```

---

## 📝 Checklist de Configuração

- [ ] Ativar Email/Password no Console Firebase
- [ ] Ativar Google Sign-In no Console Firebase
- [ ] Configurar domínios autorizados
- [ ] Configurar regras de segurança Firestore
- [ ] Testar login local
- [ ] Testar login em produção (após deploy)

---

**Última atualização**: 12/12/2025
