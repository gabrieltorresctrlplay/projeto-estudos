# oiee

Projeto base minimalista com **Vite + React + TypeScript + Tailwind CSS v4 + Firebase**.

## 🚀 Stack Tecnológica

- **[Vite](https://vite.dev/)** v7.2.4 - Build tool ultrarrápido
- **[React](https://react.dev/)** v19.2.0 - Biblioteca UI
- **[TypeScript](https://www.typescriptlang.org/)** v5.9.3 - Tipagem estática
- **[Tailwind CSS](https://tailwindcss.com/)** v4.1.18 - Framework CSS utility-first
- **[Firebase](https://firebase.google.com/)** v12.6.0 - Backend as a Service
- **[Prettier](https://prettier.io/)** v3.7.4 - Formatação de código

## 📦 Serviços Firebase

- ✅ **Authentication** - Email/Senha + Google Sign-In
- ✅ **Firestore** - Banco de dados NoSQL
- ✅ **Hosting** - Deploy automático

## 🎯 Status do Projeto

### ✅ Configurações Completas

- ✅ Projeto Vite inicializado com React + TypeScript
- ✅ Tailwind CSS v4 com Design System (OKLCH colors)
- ✅ Firebase configurado (Auth + Firestore + Hosting)
- ✅ Prettier com ordenação de imports e classes Tailwind
- ✅ Estrutura minimalista e clean code
- ✅ **DEPLOYED**: https://projeto-estudos-b4fcf.web.app/

### 📁 Estrutura de Arquivos

```
projeto-estudos/
├── .agent/               # 🤖 Configurações da IA
│   ├── rules/
│   │   └── rules.md      # Regras para Gemini AI
│   └── workflows/
│       ├── deploy.md     # 🚀 /deploy
│       └── end.md        # 💾 /end
├── docs/                 # 📚 Documentação
│   ├── sessions/         # Resumos automáticos (IA)
│   ├── transcripts/      # Conversas exportadas (manual)
│   ├── AUTH.md          # Guia de autenticação
│   ├── DEPLOY.md        # Guia de deploy
│   ├── LINKS.md         # Links úteis
│   ├── WORKFLOWS.md     # Workflows disponíveis
│   ├── README.md        # Índice da documentação
│   └── SETUP.md         # Setup e próximos passos
├── src/
│   ├── lib/             # Serviços Firebase
│   │   ├── firebase.ts  # Configuração
│   │   ├── auth.ts      # Autenticação
│   │   ├── firestore.ts # Firestore CRUD
│   │   └── index.ts     # Exports
│   ├── App.tsx
│   ├── index.css        # Design System + Tailwind
│   └── main.tsx
├── .env                 # Variáveis de ambiente
├── .env.example         # Template
├── .gitignore           # Git ignore
├── firebase.json        # Config Firebase Hosting
├── firestore.rules      # Regras de segurança
└── package.json
```

## 🛠️ Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview da build
npm run format   # Formatar código
npm run deploy   # Build + Deploy Firebase
```

## 🔧 Workflows (Atalhos)

Workflows são atalhos para automatizar tarefas comuns:

- **`/deploy`** - Deploy rápido para Firebase Hosting
- **`/end`** - Encerrar sessão (atualiza docs + commit + push)

Veja detalhes em **[docs/WORKFLOWS.md](docs/WORKFLOWS.md)**

## 🚦 Como Usar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Firebase

```bash
cp .env.example .env
# Edite .env com suas credenciais Firebase
```

### 3. Desenvolvimento

```bash
npm run dev
```

### 4. Deploy

```bash
npm run deploy
```

## 🔥 Usando Firebase

### Autenticação

```typescript
import { authService } from '@/lib'

// Login com Google
const { user, error } = await authService.signInWithGoogle()

// Login com Email
const { user, error } = await authService.signInWithEmail(email, password)

// Criar conta
const { user, error } = await authService.signUpWithEmail(email, password)

// Logout
await authService.signOut()
```

### Firestore

```typescript
import { firestoreService, where } from '@/lib'

// Buscar documentos
const { data } = await firestoreService.getDocuments('users')

// Buscar com filtro
const { data } = await firestoreService.getDocuments('users', where('age', '>', 18))

// Adicionar documento
const { id } = await firestoreService.addDocument('users', {
  name: 'João',
  email: 'joao@example.com',
})

// Atualizar
await firestoreService.updateDocument('users', id, { name: 'João Silva' })

// Deletar
await firestoreService.deleteDocument('users', id)
```

## 🎨 Design System

O projeto inclui um Design System completo com:

- ✅ Cores OKLCH (light + dark mode)
- ✅ Variáveis CSS semânticas
- ✅ Fontes customizadas (Inter, Playfair Display, Fira Code)
- ✅ Shadows e radius configuráveis
- ✅ Suporte nativo a dark mode

## 📚 Documentação

- **[docs/LINKS.md](docs/LINKS.md)** - Links úteis do projeto
- **[docs/AUTH.md](docs/AUTH.md)** - Guia completo de autenticação
- **[docs/DEPLOY.md](docs/DEPLOY.md)** - Guia de deploy Firebase
- **[docs/SETUP.md](docs/SETUP.md)** - Setup e próximos passos

## 🔒 Segurança

As regras de segurança do Firestore estão em `firestore.rules`.

**⚠️ IMPORTANTE**: As regras atuais são para desenvolvimento e expiram em 10/01/2026. Configure regras de produção antes de lançar!

## 📊 Estatísticas

- **Pacotes**: 172
- **Build size**: ~193 KB (gzip: ~60 KB)
- **Tempo de build**: ~1-2 segundos

## 🌐 Deploy

**URL de Produção**: https://projeto-estudos-b4fcf.web.app/

## 📝 Notas

- Projeto configurado seguindo **melhores práticas** (Context7)
- Código **limpo** e **formatado** automaticamente
- **TypeScript** totalmente tipado
- Pronto para desenvolvimento de aplicações modernas

---

**Última atualização**: 12/12/2025
