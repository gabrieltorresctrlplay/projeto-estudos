# NerfasInc

> 🔥 **YOLOMODE ATIVADO** - Repositório de testes com auto-execução total! [Saiba mais](docs/YOLOMODE.md)

Projeto base minimalista com **Vite + React + TypeScript + Tailwind CSS v4 + Firebase**.

## 🚀 Stack Tecnológica

### Core

- **[Vite](https://vite.dev/)** v7.2.4 - Build tool ultrarrápido
- **[React](https://react.dev/)** v19.2.0 - Biblioteca UI
- **[TypeScript](https://www.typescriptlang.org/)** v5.9.3 - Tipagem estática
- **[React Router](https://reactrouter.com/)** v7.10.1 - Navegação

### Styling & UI

- **[Tailwind CSS](https://tailwindcss.com/)** v4.1.18 - Framework CSS utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes reutilizáveis (16 instalados)
- **[Radix UI](https://www.radix-ui.com/)** - Primitives acessíveis (6 instalados)
- **[Lucide Icons](https://lucide.dev/)** v0.561.0 - Biblioteca de ícones
- **[Framer Motion](https://www.framer.com/motion/)** v12.23.26 - Animações

### Backend & Services

- **[Firebase](https://firebase.google.com/)** v12.6.0 - Backend as a Service
  - Authentication (Email/Senha + Google)
  - Firestore Database
  - Hosting

### Utilities

- **[class-variance-authority](https://cva.style/docs)** - Variantes de componentes
- **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Merge de classes Tailwind
- **[clsx](https://github.com/lukeed/clsx)** - Conditional classNames
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
- ✅ **React Router v7** configurado + Aliases (`@/`)
- ✅ **shadcn/ui** configurado (New York style)
- ✅ **Radix UI** primitives instalados
- ✅ Prettier com ordenação de imports e classes Tailwind
- ✅ **Arquitetura Refatorada** - Código modular e escalável
- ✅ **Custom Hooks** para animações e acessibilidade
- ✅ **TypeScript Types** centralizados
- ✅ **Lazy Loading** com React Suspense
- ✅ **Acessibilidade (a11y)** - ARIA labels e reduced motion

### ✅ Features Implementadas

**Autenticação:**

- ✅ Páginas de Login/Register completas
- ✅ Auth com Email/Senha + Google Sign-In
- ✅ Rotas protegidas (ProtectedRoute)
- ✅ Rotas públicas (PublicOnlyRoute)

**Dashboard:**

- ✅ Sidebar oficial shadcn/ui (collapsible)
- ✅ Sistema de gerenciamento de empresas
- ✅ Context API (CompanyContext)
- ✅ Multi-company support
- ✅ Páginas: Dashboard, Queue, Settings

**UI Components (shadcn/ui):**

- ✅ 16+ componentes instalados e configurados
- ✅ Avatar, Button, Card, Dialog
- ✅ Dropdown Menu, Input, Label
- ✅ Separator, Sheet, Sidebar
- ✅ Skeleton, Tooltip
- ✅ Company Selector (custom)

**Theme:**

- ✅ Dark/Light mode toggle
- ✅ Theme provider com Context API
- ✅ Suporte a prefers-color-scheme
- ✅ Design System OKLCH completo

**Deployment:**

- ✅ **DEPLOYED**: https://projeto-estudos-b4fcf.web.app/

### 📁 Estrutura de Arquivos

```
projeto-estudos/
├── .agent/               # 🤖 Configurações da IA
│   ├── rules/            # Regras para Gemini AI
│   └── workflows/        # /start, /deploy, /end
├── docs/                 # 📚 Documentação
│   ├── sessions/         # Resumos automáticos
│   ├── AUTH.md           # Guia de autenticação
│   ├── DEPLOY.md         # Guia de deploy
│   ├── LINKS.md          # Links úteis
│   └── README.md         # Índice
├── src/
│   ├── assets/           # Logo e imagens
│   ├── components/
│   │   ├── auth/         # ProtectedRoute, PublicOnlyRoute
│   │   ├── dashboard/    # CompanyOverview, EmptyCompanyState
│   │   ├── home/         # Hero, FeatureCard, FeatureGrid
│   │   ├── layout/
│   │   │   ├── dashboard/  # AppSidebar, DashboardLayout
│   │   │   └── ...       # MainLayout, AuthLayout, Topbar, Footer
│   │   ├── theme/        # ThemeProvider, ModeToggle
│   │   └── ui/           # 16+ componentes shadcn/ui
│   │       ├── avatar.tsx, button.tsx, card.tsx
│   │       ├── dialog.tsx, dropdown-menu.tsx
│   │       ├── input.tsx, label.tsx
│   │       ├── separator.tsx, sheet.tsx
│   │       ├── sidebar.tsx, skeleton.tsx, tooltip.tsx
│   │       ├── company-selector.tsx
│   │       └── create-company-dialog.tsx
│   ├── contexts/         # CompanyContext (Context API)
│   ├── hooks/            # Custom hooks
│   │   ├── useAnimationVariants.ts
│   │   ├── useReducedMotion.ts
│   │   ├── useCompanies.ts
│   │   └── use-mobile.ts
│   ├── constants/        # features, navigation
│   ├── types/            # TypeScript types
│   ├── lib/              # Firebase services + utils
│   ├── pages/
│   │   ├── auth/         # Login, Register
│   │   ├── dashboard/    # Dashboard, Queue, UnderConstruction
│   │   └── Home.tsx
│   └── ...
├── components.json       # Config shadcn/ui
├── firebase.json         # Config Firebase
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

- **`/start`** - Iniciar sessão (carrega contexto do projeto)
- **`/deploy`** - Deploy rápido para Firebase Hosting
- **`/end`** - Encerrar sessão (atualiza docs + commit + push)

Veja detalhes em `.agent/workflows/`

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

## 🎨 Componentes shadcn/ui

O projeto usa a biblioteca [shadcn/ui](https://ui.shadcn.com/) com estilo **New York**.

### Instalados (16 componentes)

- **Layout:** Sidebar (oficial), Sheet
- **Dados:** Avatar, Card, Separator, Skeleton
- **Forms:** Button, Input, Label, Dialog
- **Interação:** Dropdown Menu, Tooltip
- **Custom:** Company Selector, Create Company Dialog

### Configuração

Configurado em `components.json`:

- Style: `new-york`
- Icon Library: `lucide-react`
- CSS Variables: Habilitado
- Base Color: `neutral`

### Adicionar Novos Componentes

```bash
npx shadcn@latest add [component-name]
```

## 🏢 Context API

### CompanyContext

Sistema de gerenciamento de empresas usando Context API.

**Arquivo:** `src/contexts/CompanyContext.tsx`

```typescript
import { useCompanyContext } from '@/contexts/CompanyContext'

function MyComponent() {
  const {
    companies, // Lista de empresas do usuário
    selectedCompany, // Empresa atualmente selecionada
    isLoading, // Estado de carregamento
    error, // Erros, se houver
    createCompany, // Criar nova empresa
    selectCompany, // Selecionar empresa
    refreshCompanies, // Recarregar lista
  } = useCompanyContext()
}
```

**Hook:** `src/hooks/useCompanies.ts` - Lógica de CRUD das empresas

## 📚 Documentação

- **[docs/LINKS.md](docs/LINKS.md)** - Links úteis do projeto
- **[docs/AUTH.md](docs/AUTH.md)** - Guia completo de autenticação
- **[docs/DEPLOY.md](docs/DEPLOY.md)** - Guia de deploy Firebase

## 🔒 Segurança

As regras de segurança do Firestore estão em `firestore.rules`.

**⚠️ IMPORTANTE**: As regras atuais são para desenvolvimento e expiram em 10/01/2026. Configure regras de produção antes de lançar!

## 📊 Estatísticas

- **Dependências**: 29 pacotes
- **Dev Dependencies**: 13 pacotes
- **Componentes shadcn/ui**: 16
- **Radix UI Primitives**: 6
- **Páginas**: 6 (Home, Login, Register, Dashboard, Queue, UnderConstruction)
- **Build size**: ~193 KB (gzip: ~60 KB)
- **Tempo de build**: ~4-5 segundos

## 🌐 Deploy

**URL de Produção**: https://projeto-estudos-b4fcf.web.app/

## 📝 Notas

- Projeto configurado seguindo **melhores práticas** (Context7)
- Código **limpo** e **formatado** automaticamente
- **TypeScript** totalmente tipado
- Pronto para desenvolvimento de aplicações modernas

---

**Última atualização**: 13/12/2025
