import daBoiAvatar from '../client/static/da-boi.webp';
import kivo from '../client/static/examples/kivo.webp';
import messync from '../client/static/examples/messync.webp';
import microinfluencerClub from '../client/static/examples/microinfluencers.webp';
import promptpanda from '../client/static/examples/promptpanda.webp';
import reviewradar from '../client/static/examples/reviewradar.webp';
import scribeist from '../client/static/examples/scribeist.webp';
import searchcraft from '../client/static/examples/searchcraft.webp';
import { BlogUrl, DocsUrl } from '../shared/common';
import type { GridFeature } from './components/FeaturesGrid';

export const features: GridFeature[] = [
  {
    name: 'Agendamento Online',
    description: 'Sistema de agendamento 24/7 com confirmação automática via WhatsApp',
    emoji: '📅',
    size: 'large',
    href: '/appointments',
  },
  {
    name: 'Gestão de Clientes',
    description: 'CRM completo com histórico, preferências e programa de fidelidade',
    emoji: '👥',
    size: 'medium',
    href: '/clients',
  },
  {
    name: 'Controle Financeiro',
    description: 'Caixa, comissões e relatórios automáticos com Mercado Pago e Stripe',
    emoji: '💰',
    size: 'large',
    href: '/cash-register',
  },
  {
    name: 'Gestão de Estoque',
    description: 'Controle de produtos com alertas automáticos de reposição',
    emoji: '📦',
    size: 'medium',
    href: '/inventory',
  },
  {
    name: 'Relatórios Inteligentes',
    description: 'Dashboards em tempo real com todas as métricas do seu negócio',
    emoji: '📊',
    size: 'medium',
    href: '/reports',
  },
  {
    name: 'Catálogo de Serviços',
    description: 'Organize serviços, preços e durações de forma profissional',
    emoji: '✂️',
    size: 'small',
    href: '/services',
  },
  {
    name: 'Integração WhatsApp',
    description: 'Confirmações e lembretes automáticos via WhatsApp Business',
    emoji: '�',
    size: 'small',
    href: '/notifications',
  },
  {
    name: 'Assistente IA',
    description: 'Agente inteligente com OpenAI para análise e insights do negócio',
    emoji: '🤖',
    size: 'medium',
    href: '/ai',
  },
  {
    name: 'Multi-dispositivo',
    description: 'Acesse de qualquer lugar: celular, tablet ou computador',
    emoji: '📱',
    size: 'small',
    href: '/dashboard',
  },
  {
    name: 'Sincronização Google',
    description: 'Integração com Google Calendar para agenda unificada',
    emoji: '📆',
    size: 'small',
    href: '/integrations',
  },
  {
    name: 'Pagamentos Online',
    description: 'Aceite pagamentos com Mercado Pago, PagSeguro e Stripe',
    emoji: '💳',
    size: 'small',
    href: '/payments',
  },
  {
    name: 'Segurança Total',
    description: 'Dados protegidos com criptografia e backup automático diário',
    emoji: '🔒',
    size: 'small',
    href: '/security',
  },
];

export const testimonials = [
  {
    name: 'Mariana Silva',
    role: 'Proprietária - Negócio Elegance',
    avatarSrc: daBoiAvatar,
    socialUrl: '#',
    quote: 'O Glamo transformou completamente a gestão do meu negócio. Antes eu perdia horas com planilhas, agora tudo é automático. Aumentei meu faturamento em 30% no primeiro trimestre!',
  },
  {
    name: 'Carlos Eduardo',
    role: 'Gerente - Barbearia Premium',
    avatarSrc: daBoiAvatar,
    socialUrl: '#',
    quote: 'A melhor decisão que tomei para minha barbearia. O controle de comissões ficou transparente e a equipe adorou. Recomendo para todos os colegas do setor.',
  },
  {
    name: 'Ana Paula Costa',
    role: 'Diretora - Rede Beleza & Cia',
    avatarSrc: daBoiAvatar,
    socialUrl: '#',
    quote: 'Gerencio 3 unidades e o Glamo me dá visão completa de tudo em tempo real. Os relatórios são incríveis e me ajudam a tomar decisões estratégicas rapidamente.',
  },
  {
    name: 'Roberto Mendes',
    role: 'Proprietário - Studio Hair',
    avatarSrc: daBoiAvatar,
    socialUrl: '#',
    quote: 'Interface super intuitiva e moderna. Minha equipe aprendeu a usar em menos de um dia. O suporte é excepcional e sempre disponível.',
  },
  {
    name: 'Juliana Ferreira',
    role: 'Gerente - Spa Zen',
    avatarSrc: daBoiAvatar,
    socialUrl: '#',
    quote: 'O controle de estoque integrado com vendas economizou muito dinheiro. Acabaram os desperdícios e produtos parados. Sistema completo e eficiente!',
  },
  {
    name: 'Fernando Alves',
    role: 'Proprietário - Beauty Center',
    avatarSrc: daBoiAvatar,
    socialUrl: '#',
    quote: 'Migrei de outro sistema e não me arrependo. O Glamo é muito mais completo e o preço é justo. Melhor custo-benefício do mercado.',
  },
];

export const faqs = [
  {
    id: 1,
    question: 'Como funciona o período de teste gratuito?',
    answer: 'Você tem 14 dias para testar todas as funcionalidades do Glamo sem precisar informar cartão de crédito. É só criar sua conta e começar a usar imediatamente.',
  },
  {
    id: 2,
    question: 'Preciso instalar algum software?',
    answer: 'Não! O Glamo é 100% online (cloud). Você acessa de qualquer navegador, no computador, tablet ou celular. Sempre atualizado e sem instalação.',
  },
  {
    id: 3,
    question: 'Meus dados estão seguros?',
    answer: 'Sim! Utilizamos criptografia de ponta e backup automático diário. Seus dados ficam em servidores seguros e protegidos com as melhores práticas de segurança do mercado.',
  },
  {
    id: 4,
    question: 'Posso importar dados do meu sistema atual?',
    answer: 'Sim! Nossa equipe ajuda gratuitamente na migração dos seus dados (clientes, serviços, produtos). O processo é simples e rápido.',
  },
  {
    id: 5,
    question: 'Quantos usuários podem acessar ao mesmo tempo?',
    answer: 'Depende do plano escolhido. Mas todos os planos permitem múltiplos usuários simultâneos. Entre em contato para escolher o melhor plano para seu negócio.',
  },
  {
    id: 6,
    question: 'Posso cancelar a qualquer momento?',
    answer: 'Sim! Não há fidelidade. Você pode cancelar quando quiser, sem multas ou taxas. E pode voltar quando desejar, seus dados ficam guardados por 90 dias.',
  },
  {
    id: 7,
    question: 'Tem suporte em português?',
    answer: 'Sim! Nosso suporte é 100% em português, feito por brasileiros que entendem do seu negócio. Atendemos por chat, e-mail e telefone.',
  },
  {
    id: 8,
    question: 'O Glamo funciona offline?',
    answer: 'O sistema precisa de internet, mas tem tolerância a conexões instáveis. Em breve teremos modo offline para funções essenciais.',
  },
];

export const footerNavigation = {
  app: [
    { name: 'Documentação', href: DocsUrl },
    { name: 'Blog', href: BlogUrl },
    { name: 'Suporte', href: '#suporte' },
    { name: 'API', href: '#api' },
  ],
  company: [
    { name: 'Sobre', href: '#sobre' },
    { name: 'Contato', href: '#demo' },
    { name: 'Privacidade', href: '#privacidade' },
    { name: 'Termos de Uso', href: '#termos' },
  ],
};

export const examples = [
  {
    name: 'Example #1',
    description: 'Describe your example here.',
    imageSrc: kivo,
    href: '#',
  },
  {
    name: 'Example #2',
    description: 'Describe your example here.',
    imageSrc: messync,
    href: '#',
  },
  {
    name: 'Example #3',
    description: 'Describe your example here.',
    imageSrc: microinfluencerClub,
    href: '#',
  },
  {
    name: 'Example #4',
    description: 'Describe your example here.',
    imageSrc: promptpanda,
    href: '#',
  },
  {
    name: 'Example #5',
    description: 'Describe your example here.',
    imageSrc: reviewradar,
    href: '#',
  },
  {
    name: 'Example #6',
    description: 'Describe your example here.',
    imageSrc: scribeist,
    href: '#',
  },
  {
    name: 'Example #7',
    description: 'Describe your example here.',
    imageSrc: searchcraft,
    href: '#',
  },
];
