---
description: UI/UX Consistency Audit
---

**COMANDO DE AUDITORIA: PRISM PROTOCOL**

Estou submetendo um novo código/rota para verificação de qualidade visual.

**ARQUIVO ALVO:** [INSIRA O CAMINHO OU COLE O CÓDIGO DA NOVA ROTA AQUI]

**INSTRUÇÕES PARA O AGENTE:**

1.  **Context Check:** Use o **Context7** para comparar o "ARQUIVO ALVO" com o nosso "Gold Standard" (leia `src/components/ui/button.tsx` e `src/index.css` para referência).
2.  **Visual Linting:** Procure por violações do Design System:
    - [ ] Uso de cores hardcoded (ex: `bg-blue-500` em vez de `bg-primary`).
    - [ ] Falta de estados de interação (`hover`, `active`).
    - [ ] Inconsistência no efeito Glass (está usando o blur/opacidade correto?).
    - [ ] Botões ou Inputs que não usam os componentes base da UI (`shadcn/ui`).
3.  **Relatório:**
    - Se estiver tudo perfeito, responda apenas: "✨ **PRISM APPROVED:** A UI segue estritamente o Design System."
    - Se houver erros, liste-os como "violações" e forneça o snippet de código corrigido mantendo o layout original.

Execute a auditoria agora.
