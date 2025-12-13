---
trigger: always_on
---

# 🎨 Regras de Design e Conteúdo

## 1. Identidade Visual (Non-Negotiable)

- **Tema base**: `src/index.css` é a fonte da verdade. **NÃO REESCREVA** as variáveis de cor ou estrutura base CSS a menos que explicitamente solicitado.
- **Classes Utilitárias**: Use `bg-primary`, `text-primary-foreground`, `bg-muted`, etc.
- **Dark/Light Mode**: Respeite os tokens do CSS (ex: `var(--background)`, `var(--foreground)`).

## 2. Conteúdo e Copy

- **Fase Atual**: Produto Corporativo / SaaS Genérico.
- **Tom de Voz**: Profissional, Moderno, "Enterprise".
- **Palavras-chave**: Soluções, Escalar, Otimização, Dados, Segurança.
- **O que EVITAR**:
  - Não cite o stack técnico no frontend (User não quer saber se é React ou Vite).
  - Não use termos de "desenvolvedor" nas landing pages (ex: "componentes", "hooks").

## 3. UI/UX Standard

- **Animações**: Sutis e fluidas (`framer-motion`). Nada de piscar tela ou transições bruscas.
- **Espaçamento**: Use o grid de 4px do Tailwind (`gap-4`, `p-6`). Respire.
- **Glassmorphism**: Permitido para cartões e overlays (`backdrop-blur-sm`).
