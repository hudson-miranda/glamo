# Glamo Neon Design System

Uma biblioteca completa de componentes e tokens de design para criar interfaces modernas com tema dark e efeitos neon.

## 📋 Índice

- [Paleta de Cores](#-paleta-de-cores)
- [Tokens de Design](#-tokens-de-design)
- [Componentes](#-componentes)
- [Classes Utilitárias](#-classes-utilitárias)
- [Animações](#-animações)
- [Exemplos de Uso](#-exemplos-de-uso)
- [Acessibilidade](#-acessibilidade)

---

## 🎨 Paleta de Cores

### Neon Green (Cor Primária)

A paleta principal do design system é baseada no verde neon (`#00FF94`).

| Variante | Hex Code | Tailwind Class | Uso Recomendado |
|----------|----------|----------------|-----------------|
| Neon 50  | `#e6fff5` | `neon-50` | Backgrounds muito claros |
| Neon 100 | `#b3ffe0` | `neon-100` | Backgrounds claros |
| Neon 200 | `#80ffcc` | `neon-200` | Borders suaves |
| Neon 300 | `#4dffb8` | `neon-300` | Hover states |
| Neon 400 | `#1affa3` | `neon-400` | Active states |
| **Neon 500** | **`#00FF94`** | `neon-500` | **Principal** |
| Neon 600 | `#00cc76` | `neon-600` | Pressed states |
| Neon 700 | `#009959` | `neon-700` | Text escuro |
| Neon 800 | `#00663b` | `neon-800` | Backgrounds escuros |
| Neon 900 | `#00331e` | `neon-900` | Backgrounds muito escuros |

### Dark Theme Backgrounds

| Cor | HSL | Tailwind Variable | Uso |
|-----|-----|-------------------|-----|
| Background Primary | `hsl(0 0% 3%)` | `--background` | Background principal |
| Background Secondary | `hsl(0 0% 7%)` | `--card` | Cards e elementos elevados |
| Background Tertiary | `hsl(0 0% 10%)` | `--card-accent` | Elementos ainda mais elevados |

### Cores de Estado

| Estado | Cor | Tailwind Class |
|--------|-----|----------------|
| Success | `hsl(141 71% 48%)` | `success` |
| Warning | `hsl(36 100% 50%)` | `warning` |
| Error/Destructive | `hsl(0 62.8% 63%)` | `destructive` |

---

## 📐 Tokens de Design

### Espaçamento

Seguimos a escala padrão do Tailwind com extensões customizadas:

```
spacing: 0, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, ...
```

Destaque para valores especiais:
- `4.5` (1.125rem) - Espaçamento entre ícone e texto
- `11` (2.75rem) - Padding médio de cards
- `22.5` (5.625rem) - Espaçamento entre seções

### Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `rounded-sm` | `calc(0.75rem - 4px)` | Elementos pequenos |
| `rounded-md` | `calc(0.75rem - 2px)` | Elementos médios |
| `rounded-lg` | `0.75rem` | Padrão (cards, buttons) |
| `rounded-xl` | `1rem` | Cards grandes |
| `rounded-2xl` | `1.5rem` | Seções |

### Tipografia

Escalas customizadas para títulos:

```tsx
fontSize: {
  'title-xxl': ['44px', '55px'],
  'title-xl': ['36px', '45px'],
  'title-lg': ['28px', '35px'],
  'title-md': ['24px', '30px'],
  'title-sm': ['20px', '26px'],
  'title-xsm': ['18px', '24px'],
}
```

### Shadows & Glow Effects

#### Box Shadows

| Class | Efeito | Uso |
|-------|--------|-----|
| `shadow-glow-sm` | Glow sutil | Hover em elementos pequenos |
| `shadow-glow-md` | Glow médio | Buttons, cards |
| `shadow-glow-lg` | Glow intenso | Elementos de destaque |
| `shadow-glow-xl` | Glow muito intenso | Hero elements |
| `shadow-glass` | Sombra glassmorphism | Cards com blur |

#### Drop Shadows

| Class | Uso |
|-------|-----|
| `drop-shadow-glow-sm` | Ícones e textos |
| `drop-shadow-glow-md` | Elementos médios |
| `drop-shadow-glow-lg` | Elementos grandes |

---

## 🧩 Componentes

### Button

Botão com variantes que incluem efeitos de glow.

```tsx
import { Button } from './components/ui';

// Variantes
<Button variant="primary-glow">Get Started</Button>
<Button variant="secondary">Learn More</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="outline">Contact</Button>
<Button variant="neon">Explore</Button>

// Tamanhos
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// Estados
<Button isLoading>Loading...</Button>
<Button disabled>Disabled</Button>
```

**Props:**
- `variant`: `'primary-glow' | 'secondary' | 'ghost' | 'outline' | 'neon'`
- `size`: `'sm' | 'md' | 'lg' | 'xl'`
- `isLoading`: `boolean`
- Todas as props de `HTMLButtonElement`

---

### Card

Card com suporte a glassmorphism e efeitos de glow.

```tsx
import { Card } from './components/ui';

// Variantes
<Card variant="glass">Content</Card>
<Card variant="solid">Content</Card>
<Card variant="bordered">Content</Card>
<Card variant="glass-neon">Content with neon border</Card>

// Com efeitos
<Card hover glow>
  Hover para ver os efeitos
</Card>
```

**Props:**
- `variant`: `'glass' | 'solid' | 'bordered' | 'glass-neon'`
- `hover`: `boolean` - Adiciona efeito de scale no hover
- `glow`: `boolean` - Adiciona glow no hover
- Todas as props de `HTMLDivElement`

---

### Section

Wrapper para seções da landing page.

```tsx
import { Section } from './components/ui';

<Section background="darker" glowEffect>
  <h2>Section Title</h2>
  <p>Content goes here</p>
</Section>

// Sem container interno
<Section container={false}>
  Custom layout
</Section>
```

**Props:**
- `background`: `'transparent' | 'dark' | 'darker'`
- `container`: `boolean` - Adiciona container com padding
- `glowEffect`: `boolean` - Adiciona gradiente radial de fundo
- Todas as props de `HTMLElement`

---

### GlowEffect

Efeito decorativo de luz de fundo.

```tsx
import { GlowEffect } from './components/ui';

<div className="relative">
  <GlowEffect position="top-right" size="lg" animated />
  <h1>Your content here</h1>
</div>
```

**Props:**
- `size`: `'sm' | 'md' | 'lg' | 'xl'`
- `position`: `'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`
- `color`: `'neon' | 'blue' | 'purple'`
- `animated`: `boolean` - Adiciona animação de pulse

---

### GradientText

Texto com gradiente.

```tsx
import { GradientText } from './components/ui';

<GradientText variant="neon" as="h1" className="text-5xl font-bold">
  Amazing Title
</GradientText>

<GradientText variant="neon-diagonal" animated>
  Animated gradient text
</GradientText>
```

**Props:**
- `variant`: `'neon' | 'neon-diagonal' | 'primary' | 'primary-diagonal'`
- `as`: `'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'`
- `animated`: `boolean` - Adiciona pulse de opacidade

---

### Badge

Badge com estilo neon.

```tsx
import { Badge } from './components/ui';

<Badge variant="glow" size="md" dot>New Feature</Badge>
<Badge variant="outline">Beta</Badge>
<Badge variant="solid">Pro</Badge>
```

**Props:**
- `variant`: `'neon' | 'outline' | 'solid' | 'glow'`
- `size`: `'sm' | 'md' | 'lg'`
- `dot`: `boolean` - Adiciona dot animado
- Todas as props de `HTMLSpanElement`

---

## 🎨 Classes Utilitárias

### Text Gradients

```tsx
<h1 className="text-gradient-neon">Neon Gradient</h1>
<h1 className="text-gradient-neon-diagonal">Diagonal Neon</h1>
<h1 className="text-gradient-primary">Primary Gradient</h1>
```

### Glow Effects

```tsx
<div className="glow-sm">Small glow</div>
<div className="glow-md">Medium glow</div>
<div className="glow-lg">Large glow</div>
<div className="glow-xl">Extra large glow</div>
<div className="glow-hover">Glow on hover</div>
```

### Glassmorphism

```tsx
<div className="glass-card">
  Glassmorphism card
</div>

<div className="glass-panel">
  Darker glass panel
</div>

<div className="glass-light">
  Light glass effect
</div>

<div className="glass-neon">
  Glass with neon border
</div>
```

### Background Gradients

```tsx
<div className="bg-gradient-radial-neon">
  Radial gradient background
</div>

<div className="bg-gradient-conic-neon">
  Conic gradient background
</div>
```

### Border Gradients

```tsx
<div className="border-gradient-neon">
  <div className="p-4">
    Content with gradient border
  </div>
</div>
```

---

## ✨ Animações

### Animações Disponíveis

| Class | Descrição | Duração |
|-------|-----------|---------|
| `animate-pulse-glow` | Pulse com glow effect | 2s infinite |
| `animate-float` | Flutuação suave | 3s infinite |
| `animate-glow-pulse` | Pulse de opacidade | 2s infinite |
| `animate-slide-in` | Desliza para dentro | 0.5s |
| `animate-fade-in` | Fade in | 0.5s |

### Exemplos

```tsx
<Button className="animate-pulse-glow">
  Pulsing button
</Button>

<div className="animate-float">
  Floating element
</div>

<GradientText animated>
  Animated text
</GradientText>
```

---

## 💡 Exemplos de Uso

### Hero Section

```tsx
import { Section, GradientText, Button, GlowEffect } from './components/ui';

export function Hero() {
  return (
    <Section background="darker" glowEffect className="min-h-screen flex items-center">
      <div className="relative">
        <GlowEffect position="top-right" size="xl" animated />
        
        <div className="text-center space-y-6">
          <Badge variant="glow" dot>New Feature</Badge>
          
          <GradientText as="h1" variant="neon" className="text-6xl font-bold">
            Seamless solution with magic!
          </GradientText>
          
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Life is the project management platform that aims for teams to 
            be efficient and balanced across all kinds of projects.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button variant="primary-glow" size="lg">
              Get Free Demo
            </Button>
            <Button variant="outline" size="lg">
              See All Features
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
```

### Feature Cards Grid

```tsx
import { Card, GradientText } from './components/ui';

export function Features() {
  return (
    <Section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="glass-neon" hover glow>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-neon-500/10 flex items-center justify-center">
              <IconComponent className="text-neon-500" />
            </div>
            <GradientText as="h3" variant="neon" className="text-xl font-bold">
              Product title
            </GradientText>
            <p className="text-zinc-400">
              This is a great feature
            </p>
          </div>
        </Card>
        {/* Repeat for other features */}
      </div>
    </Section>
  );
}
```

### Testimonial Section

```tsx
import { Card, Badge } from './components/ui';

export function Testimonials() {
  return (
    <Section background="dark">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="glass">
          <div className="space-y-4">
            <p className="text-lg">
              "Amazing tool! Saved me months"
            </p>
            <div className="flex items-center gap-3">
              <img src="avatar.jpg" className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-semibold">John Maker</p>
                <p className="text-sm text-zinc-500">Developer, Company</p>
              </div>
            </div>
          </div>
        </Card>
        {/* More testimonials */}
      </div>
    </Section>
  );
}
```

---

## ♿ Acessibilidade

### Princípios Seguidos

1. **Contraste de Cores**
   - Texto neon (#00FF94) sobre fundo escuro: Contraste de ~13:1
   - Texto branco sobre fundo escuro: Contraste de ~15:1
   - Conformidade com WCAG AAA

2. **Focus States**
   - Todos os componentes interativos têm `focus:ring-2`
   - Focus ring usa cor neon para visibilidade
   - `focus:ring-offset-2` para separação clara

3. **Keyboard Navigation**
   - Todos os botões e links são acessíveis via teclado
   - Ordem de tab lógica
   - Skip links onde apropriado

4. **Screen Readers**
   - Uso de `aria-label` em ícones
   - Estados de loading anunciados
   - Landmarks semânticos (`<section>`, `<nav>`, etc.)

5. **Animações**
   - Respeita `prefers-reduced-motion`
   - Animações podem ser desabilitadas via CSS

### Exemplo de Componente Acessível

```tsx
<Button
  variant="primary-glow"
  aria-label="Começar agora"
  disabled={isLoading}
>
  {isLoading ? 'Carregando...' : 'Get Started'}
</Button>
```

---

## 🚀 Quick Start

1. **Importar componentes:**

```tsx
import { Button, Card, Section } from './components/ui';
```

2. **Usar classes utilitárias:**

```tsx
<div className="glass-card glow-hover">
  <h2 className="text-gradient-neon">Title</h2>
</div>
```

3. **Combinar com Tailwind:**

```tsx
<Button 
  variant="primary-glow" 
  className="w-full md:w-auto"
>
  Responsive Button
</Button>
```

---

## 📚 Recursos Adicionais

- **Tailwind Config:** `app/tailwind.config.js`
- **CSS Variables:** `app/src/client/Main.css`
- **Componentes:** `app/src/client/components/ui/`

---

## 🎯 Best Practices

1. **Performance**
   - Use `backdrop-filter` com moderação (pode ser pesado)
   - Limite glow effects em muitos elementos simultaneamente
   - Prefira `transform` e `opacity` para animações

2. **Design Consistency**
   - Use sempre componentes do design system
   - Siga a paleta de cores definida
   - Mantenha espaçamento consistente

3. **Dark Mode**
   - O design system é otimizado para dark mode
   - Light mode ainda é suportado pelas variáveis CSS
   - Teste em ambos os modos

4. **Responsividade**
   - Use breakpoints do Tailwind: `sm:`, `md:`, `lg:`, `xl:`
   - Mobile-first approach
   - Teste em diferentes tamanhos de tela

---

**Versão:** 1.0.0  
**Última atualização:** 2025-10-30  
**Mantido por:** Equipe Glamo
