# 🧪 Guia de Testes - Sistema de Onboarding

## ⚠️ ANTES DE COMEÇAR OS TESTES

### 1. Execute a Migration do Banco

```bash
cd app
wasp db migrate-dev
```

**Nome da migration:** `add_salon_invites`

---

## 🔍 Roteiro de Testes

### ✅ TESTE 1: Novo Usuário - Fluxo de Criação de Salão

**Objetivo:** Validar que novo usuário é direcionado para onboarding e consegue criar salão com trial.

**Passos:**
1. Se estiver logado, faça logout
2. Acesse `/signup`
3. Crie nova conta com email novo
4. **ESPERAR:** Deve redirecionar automaticamente para `/onboarding`
5. **VALIDAR:** Deve mostrar 2 cards:
   - "Criar Meu Negócio" (com badge "14 Dias Grátis")
   - "Aguardar Convite"
6. Clique em "Criar Meu Negócio"
7. **VALIDAR:** Deve abrir `/onboarding/create-salon`
8. **VALIDAR:** Deve mostrar:
   - Badge "14 Dias Grátis - Plano Profissional" no topo
   - Card com lista de benefícios do trial
   - Formulário de criação
9. Preencha apenas o nome do salão (ex: "Teste Salão")
10. Clique em "Iniciar Trial Gratuito"
11. **VALIDAR:** 
    - Deve mostrar loading "Criando salão..."
    - Deve mostrar toast de sucesso: "Seu período de trial de 14 dias começou"
    - Deve redirecionar para `/dashboard`
12. **VALIDAR:** Dashboard deve carregar normalmente

**✅ Teste passou se:**
- Redirecionamento automático funcionou
- Salão foi criado
- Trial foi ativado
- Dashboard está acessível

---

### ✅ TESTE 2: Validações do Formulário

**Objetivo:** Validar que as validações de formulário estão funcionando.

**Passos:**
1. Volte para `/onboarding/create-salon` (ou crie novo usuário)
2. Deixe o nome vazio e clique em "Iniciar Trial Gratuito"
3. **VALIDAR:** Deve mostrar erro: "O nome do salão é obrigatório"
4. Digite apenas "AB" (2 caracteres) no nome
5. Clique em "Iniciar Trial Gratuito"
6. **VALIDAR:** Deve mostrar erro: "O nome do salão deve ter pelo menos 3 caracteres"
7. Digite nome válido: "Salão Teste"
8. Digite CNPJ inválido: "123"
9. Clique em "Iniciar Trial Gratuito"
10. **VALIDAR:** Deve mostrar erro: "Por favor, verifique o CNPJ informado"
11. Digite email inválido: "teste@" no campo email
12. Clique em "Iniciar Trial Gratuito"
13. **VALIDAR:** Deve mostrar erro: "Por favor, verifique o email informado"

**Teste de formatação automática:**
14. Digite no CNPJ: `12345678000190`
15. **VALIDAR:** Deve formatar para: `12.345.678/0001-90`
16. Digite no telefone: `11987654321`
17. **VALIDAR:** Deve formatar para: `(11) 98765-4321`
18. Digite no CEP: `01234567`
19. **VALIDAR:** Deve formatar para: `01234-567`

**✅ Teste passou se:**
- Todas as validações bloquearam envio
- Formatações automáticas funcionaram

---

### ✅ TESTE 3: Proteção de Rotas - Usuário SEM Salão

**Objetivo:** Validar que usuário sem salão não consegue acessar páginas protegidas.

**Passos:**
1. Crie novo usuário (signup)
2. Na tela de onboarding, **NÃO** crie salão ainda
3. Abra nova aba e digite manualmente: `http://localhost:3000/dashboard`
4. **VALIDAR:** Deve redirecionar para `/onboarding`
5. Tente acessar: `http://localhost:3000/clients`
6. **VALIDAR:** Deve redirecionar para `/onboarding`
7. Tente acessar: `http://localhost:3000/appointments`
8. **VALIDAR:** Deve redirecionar para `/onboarding`
9. Tente acessar: `http://localhost:3000/services`
10. **VALIDAR:** Deve redirecionar para `/onboarding`

**✅ Teste passou se:**
- Todas as tentativas redirecionaram para `/onboarding`
- Console mostra logs: "[OnboardingGuard] User has no salon, redirecting to onboarding"

---

### ✅ TESTE 4: Proteção de Rotas - Usuário COM Salão

**Objetivo:** Validar que usuário com salão não pode voltar para onboarding.

**Passos:**
1. Use usuário que já criou salão (ou crie um novo e crie salão)
2. Deve estar no `/dashboard`
3. Tente acessar manualmente: `http://localhost:3000/onboarding`
4. **VALIDAR:** Deve redirecionar de volta para `/dashboard`
5. Tente acessar: `http://localhost:3000/onboarding/create-salon`
6. **VALIDAR:** Deve redirecionar para `/dashboard`
7. Tente acessar: `http://localhost:3000/onboarding/waiting-invite`
8. **VALIDAR:** Deve redirecionar para `/dashboard`

**✅ Teste passou se:**
- Todas as tentativas redirecionaram para `/dashboard`
- Console mostra logs: "[OnboardingGuard] User has salon, redirecting from onboarding to dashboard"

---

### ✅ TESTE 5: Aguardar Convite - Empty State

**Objetivo:** Validar tela de aguardar convites quando não há convites.

**Passos:**
1. Crie novo usuário (signup)
2. Na tela de onboarding, clique em "Aguardar Convite"
3. **VALIDAR:** Deve abrir `/onboarding/waiting-invite`
4. **VALIDAR:** Deve mostrar empty state:
   - Mensagem: "Nenhum convite pendente"
   - Texto: "Você ainda não recebeu convites de salões"
   - Botão: "Criar Meu Próprio Salão"
5. Clique em "Criar Meu Próprio Salão"
6. **VALIDAR:** Deve redirecionar para `/onboarding/create-salon`

**✅ Teste passou se:**
- Empty state apareceu corretamente
- Botão redirecionou para criar salão

---

### ✅ TESTE 6: Dark Mode

**Objetivo:** Validar que todas as páginas suportam tema escuro.

**Passos:**
1. Ative o dark mode do sistema (ou do navegador)
2. Acesse `/onboarding`
3. **VALIDAR:** Gradientes devem estar visíveis mas mais suaves
4. **VALIDAR:** Cards devem ter background escuro
5. **VALIDAR:** Textos devem estar legíveis
6. Acesse `/onboarding/create-salon`
7. **VALIDAR:** Formulário deve estar no tema escuro
8. **VALIDAR:** Badge de trial deve manter cores vibrantes

**✅ Teste passou se:**
- Todos os elementos são legíveis no dark mode
- Gradientes brand estão visíveis

---

### ✅ TESTE 7: Responsividade Mobile

**Objetivo:** Validar que páginas funcionam bem em mobile.

**Passos:**
1. Abra DevTools (F12)
2. Ative modo mobile (Ctrl+Shift+M ou ícone de celular)
3. Acesse `/onboarding`
4. **VALIDAR:** Cards devem empilhar verticalmente
5. **VALIDAR:** Botões devem ter boa área de toque
6. Acesse `/onboarding/create-salon`
7. **VALIDAR:** Formulário deve ocupar largura total
8. **VALIDAR:** Grid de campos deve colapsar para 1 coluna
9. **VALIDAR:** Botões no footer devem empilhar verticalmente

**✅ Teste passou se:**
- Layout adapta bem para mobile
- Todos os elementos são acessíveis

---

## 🐛 Checklist de Problemas Comuns

### Se a migration falhar:

```bash
# Ver erro específico
cd app
wasp db migrate-dev

# Se erro de "table exists", resetar (CUIDADO: apaga dados)
wasp db reset
wasp db migrate-dev
```

### Se não redirecionar para onboarding:

1. Abra Console (F12)
2. Veja se há logs do OnboardingGuard
3. Verifique se `user.activeSalonId` é `null`:
   ```javascript
   // No console do browser:
   console.log(user)
   ```

### Se erro "Cannot read property of undefined":

1. Verifique se migration rodou corretamente
2. Verifique se seeds foram executados:
   ```bash
   cd app
   wasp db seed
   ```

### Se formatação não funcionar:

1. Verifique se você está digitando (não colando)
2. Funções de formatação só acionam no evento `onChange`

---

## 📊 Checklist Final

Após todos os testes, verifique:

- [ ] Migration executada com sucesso
- [ ] Novo usuário redireciona para `/onboarding`
- [ ] Criar salão funciona e ativa trial
- [ ] Validações de formulário bloqueiam erros
- [ ] Formatações automáticas funcionam
- [ ] Usuário sem salão não acessa páginas protegidas
- [ ] Usuário com salão não acessa onboarding
- [ ] Empty state de convites aparece
- [ ] Dark mode funciona
- [ ] Mobile responsivo funciona

---

## ✅ Quando Todos os Testes Passarem

Me avise com:
- ✅ "Todos os testes passaram"
- ⚠️ "Teste X falhou" (descreva o problema)

Próximo passo será implementar a tela de Gestão de Funcionários para testar o sistema de convites completo! 🚀
