# Page snapshot

```yaml
- generic [ref=e3]:
    - button [ref=e4]:
        - img
    - button "Toggle theme" [ref=e6]:
        - img
        - generic [ref=e7]: Toggle theme
    - generic [ref=e8]:
        - generic [ref=e9]:
            - img [ref=e12]
            - heading "Bem-vindo" [level=1] [ref=e15]
            - paragraph [ref=e16]: Entre com sua conta Google para continuar
        - generic [ref=e17]:
            - generic [ref=e18]:
                - heading "Entrar" [level=3] [ref=e19]
                - paragraph [ref=e20]: Use sua conta Google para acessar a plataforma
            - generic [ref=e21]:
                - button "Continuar com Google" [ref=e22]:
                    - img
                    - text: Continuar com Google
                - paragraph [ref=e23]:
                    - text: Ao continuar, você aceita nossos
                    - link "Termos de Serviço" [ref=e24] [cursor=pointer]:
                        - /url: '#'
                    - text: e
                    - link "Política de Privacidade" [ref=e25] [cursor=pointer]:
                        - /url: '#'
                    - text: .
        - paragraph [ref=e27]: © 2025 NerfasInc. Todos os direitos reservados.
```
