/**
 * Configuração de aparência para os componentes de autenticação do Wasp
 * Define cores usando apenas os tokens oficialmente suportados
 * 
 * Tokens oficiais disponíveis:
 * - waspYellow, gray700, gray600, gray500, gray400, red, darkRed, green
 * - brand, brandAccent, submitButtonText
 * - errorBackground, errorText, successBackground, successText, formErrorText
 * 
 * NOTA: O texto "Or continue with" não tem token dedicado no Wasp.
 * A cor dele é controlada via CSS (ver auth-overrides.css)
 */

export const authAppearance = {
  colors: {
    // Cores da marca (brand)
    brand: '#9333ea', // purple-600 - Botões, links, elementos principais
    brandAccent: '#510c91ff', // brand-600 - Hover, estados ativos
    submitButtonText: 'white', // Texto dos botões de submit
    
    // Cores de cinza (usadas em textos e bordas)
    gray700: '#374151', // Textos principais escuros
    gray600: '#4b5563', // Textos secundários
    gray500: '#6b7280', // Textos terciários, placeholders
    gray400: '#9ca3af', // Textos desabilitados, bordas sutis
    
    // Cores de feedback
    errorBackground: '#fee2e2', // red-100 - Fundo de mensagens de erro
    errorText: '#dc2626', // red-600 - Texto de erro
    formErrorText: '#dc2626', // red-600 - Texto de erro em formulários
    successBackground: '#d1fae5', // green-100 - Fundo de mensagens de sucesso
    successText: '#059669', // green-600 - Texto de sucesso
    
    // Cores de alerta/estado
    red: '#dc2626', // red-600
    darkRed: '#991b1b', // red-800
    green: '#059669', // green-600
  },
};
