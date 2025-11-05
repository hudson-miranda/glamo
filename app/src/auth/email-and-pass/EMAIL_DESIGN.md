# 📧 Design System de E-mails - Glamo

## Visão Geral

Os e-mails do Glamo foram redesenhados para seguir o mesmo design system das páginas de landing page, login e signup, garantindo uma experiência consistente e profissional.

## ✨ Características Principais

### Design System Unificado
- **Cores**: Gradiente brand (brand-400 #ADA5FB → brand-600 #6B5CF6)
- **Tipografia**: Sans-serif system fonts (-apple-system, Segoe UI, Roboto)
- **Border Radius**: 12-16px para elementos principais
- **Sombras**: Suaves e consistentes com as telas web

### Componentes

#### Header
- Gradiente brand-400 para brand-600 (135deg)
- Logo "Glamo" em branco bold 32px
- Subtítulo descritivo do sistema

#### Corpo do E-mail
- Ícone circular com background gradient suave
- Título principal em 28px bold
- Descrição clara e concisa
- CTA button com gradiente e shadow
- Link alternativo em caixa cinza

#### Footer
- Informações de copyright
- Link de suporte
- Disclaimer de e-mail automático

## 📋 Tipos de E-mail

### 1. Verificação de E-mail (`getVerificationEmailContent`)

**Subject**: `✨ Confirme seu e-mail - Glamo`

**Elementos**:
- ✉️ Ícone de envelope
- Botão "Confirmar E-mail" com gradiente
- Link de verificação em caixa cinza
- Aviso de expiração (24h) em amarelo

**Versão texto** incluída para clientes que bloqueiam HTML

### 2. Redefinição de Senha (`getPasswordResetEmailContent`)

**Subject**: `🔐 Redefinição de senha - Glamo`

**Elementos**:
- 🔒 Ícone de cadeado
- Botão "Redefinir Senha" com gradiente
- Aviso de segurança em vermelho (1h de validade)
- Dicas de segurança em caixa azul

**Versão texto** incluída para clientes que bloqueiam HTML

## 🛡️ Melhores Práticas para Deliverability

### 1. Evitar Spam

✅ **Incluído**:
- Versão texto plano (text) além do HTML
- Nome de remetente claro: "Glamo"
- Subject lines descritivos sem CAPS LOCK excessivo
- Emojis moderados (apenas 1-2 por subject)
- Links seguros (HTTPS)
- Informações de contato visíveis
- Opção de ignorar e-mail claramente mencionada

❌ **Evitado**:
- Palavras spam ("GRÁTIS", "URGENTE", "CLIQUE AQUI")
- Excesso de imagens
- Links encurtados suspeitos
- HTML quebrado ou mal formatado
- Falta de versão texto

### 2. HTML Responsivo

- Tabelas para layout (compatível com todos os clientes)
- Inline CSS (alguns clientes removem `<style>`)
- Comentários condicionais para Outlook (`<!--[if mso]>`)
- Max-width: 600px (padrão mobile-friendly)
- Fontes seguras e fallbacks

### 3. Acessibilidade

- Atributos `role="presentation"` em tabelas de layout
- Alt text em imagens (quando usadas)
- Contraste de cores adequado (WCAG AA)
- Tamanho de fonte legível (16px+ para corpo)
- Links com área clicável adequada (min 44x44px)

### 4. Segurança

- Links com protocolo HTTPS
- Avisos de expiração claros
- Instruções para casos de não solicitação
- Informações de contato para suporte

## 🎨 Paleta de Cores

```css
/* Brand Colors (Soft Purple) */
--brand-400: #ADA5FB;
--brand-500: #7C6FF0; /* Primary */
--brand-600: #6B5CF6;

/* Neutrals */
--gray-900: #111827;
--gray-700: #374151;
--gray-600: #4b5563;
--gray-500: #6b7280;
--gray-400: #9ca3af;
--gray-200: #e5e7eb;
--gray-100: #f3f4f6;
--gray-50: #f9fafb;

/* Status */
--yellow-50: #fef3c7;
--yellow-600: #f59e0b;
--yellow-900: #92400e;

--red-50: #fee2e2;
--red-600: #ef4444;
--red-900: #991b1b;

--blue-50: #f0f9ff;
--blue-200: #bae6fd;
--blue-900: #0c4a6e;

--green-100: #d1fae5;
--green-600: #10b981;
```

## 📊 Métricas de Qualidade

### SendGrid Score Esperado
- **Spam Score**: < 5.0 (excelente)
- **Design Score**: > 90% (responsivo + acessível)
- **Content Score**: > 85% (texto/HTML balanceado)

### Testes Recomendados
1. ✅ Litmus/Email on Acid para preview em múltiplos clientes
2. ✅ Teste de spam score (Mail-tester.com)
3. ✅ Preview em Gmail, Outlook, Apple Mail
4. ✅ Teste mobile (iOS + Android)

## 🔧 Manutenção

Para atualizar os e-mails:

1. Edite `emails.ts`
2. Mantenha a estrutura do template (`getEmailTemplate`)
3. Sempre inclua versão `text` e `html`
4. Teste em clientes de e-mail antes de deploy
5. Monitore métricas de deliverability no SendGrid

## 📞 Contato de Suporte

Os e-mails incluem: `suporte@glamo.com.br`

**Importante**: Configure este endereço antes de ir para produção!

---

**Última atualização**: Novembro 2025
