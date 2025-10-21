### Convenções Gerais

* **TypeScript estrito**
* **Padronização de nome:** camelCase para variáveis, PascalCase para models
* **Tratamento de Erros:** throw custom errors com mensagens descritivas
* **Logs:** JSON estruturado + tabela `Log`
* **Testes:** Jest para units; integração para Actions/Queries
* **DoD:**

  * Tests 100% passando
  * Guard de permissão aplicado
  * Migração Prisma criada
  * Seed atualizado
  * Documentação do módulo em `docs/glamo/modules/<nome>.md`