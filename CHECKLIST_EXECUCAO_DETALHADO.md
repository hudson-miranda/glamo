# 📝 CHECKLIST DE EXECUÇÃO - IMPLEMENTAÇÃO GLAMO
## Guia Passo-a-Passo para Desenvolvimento Incremental

**Data:** 13 de Novembro de 2025  
**Objetivo:** Executar implementação de forma sistemática e sem erros

---

## 🎯 COMO USAR ESTE DOCUMENTO

### Metodologia de Trabalho

1. **Selecione uma tarefa** da fase atual
2. **Leia completamente** o checklist antes de começar
3. **Execute item por item** marcando ✅ ao concluir
4. **Teste imediatamente** após cada implementação
5. **Commit frequente** para salvar progresso
6. **Validação completa** antes de próxima tarefa

### Regras de Ouro

- ❌ **NÃO pular** etapas do checklist
- ❌ **NÃO fazer** múltiplas tarefas simultaneamente
- ❌ **NÃO fazer commit** sem testar
- ✅ **SEMPRE backup** antes de mudanças grandes
- ✅ **SEMPRE testar** no navegador após alteração
- ✅ **SEMPRE verificar** console por erros

---

## FASE 1: BLOQUEADORES CRÍTICOS

### TAREFA 1.1: Componente UI Tabs + Detalhes de Cliente

**Estimativa:** 8 horas  
**Prioridade:** 🔴 CRÍTICA

#### SUBTAREFA 1.1.1: Instalar Dependências (15 min)

```bash
# Passo 1: Navegar para diretório do app
□ cd app

# Passo 2: Instalar Radix UI Tabs
□ npm install @radix-ui/react-tabs

# Passo 3: Verificar instalação
□ npm list @radix-ui/react-tabs

# Passo 4: Voltar para raiz (se necessário)
□ cd ..
```

**Validação:**
- ✅ Package aparece em app/package.json
- ✅ node_modules/@radix-ui/react-tabs existe

---

#### SUBTAREFA 1.1.2: Criar Componente ui/tabs (30 min)

```bash
# Passo 1: Criar diretório ui (se não existe)
□ New-Item -ItemType Directory -Force -Path "app/src/components/ui"

# Passo 2: Criar arquivo tabs.tsx
□ New-Item -ItemType File -Path "app/src/components/ui/tabs.tsx"
```

**Código do Componente:**

```tsx
// app/src/components/ui/tabs.tsx
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

// Função auxiliar para combinar classes (se não existir)
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
```

**Checklist de Implementação:**
```
□ Arquivo criado em app/src/components/ui/tabs.tsx
□ Imports do @radix-ui/react-tabs estão corretos
□ Função cn() implementada (ou importada de lib/utils)
□ Componentes exportados (Tabs, TabsList, TabsTrigger, TabsContent)
□ TypeScript sem erros
```

**Teste Rápido:**
```tsx
// Criar arquivo temporário app/src/components/ui/tabs.test.tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'

export default function TabsTest() {
  return (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content 1</TabsContent>
      <TabsContent value="tab2">Content 2</TabsContent>
    </Tabs>
  )
}
```

**Validação:**
- ✅ TypeScript compila sem erros
- ✅ Componente pode ser importado
- ✅ (Opcional) Teste visual funciona

---

#### SUBTAREFA 1.1.3: Criar Componentes de Abas (3 horas)

**Estrutura de Arquivos a Criar:**
```
app/src/client/modules/clients/components/
├── ClientOverviewTab.tsx       (1h)
├── ClientNotesTab.tsx          (45min)
├── ClientDocumentsTab.tsx      (45min)
├── ClientHistoryTab.tsx        (30min)
└── ClientAppointmentsTab.tsx   (Já existe ou criar - 30min)
```

##### 1. ClientOverviewTab.tsx (1 hora)

```tsx
// app/src/client/modules/clients/components/ClientOverviewTab.tsx
import React from 'react';

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

interface ClientOverviewTabProps {
  client: Client;
}

export default function ClientOverviewTab({ client }: ClientOverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Informações Pessoais */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Informações Pessoais</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Nome Completo</label>
            <p className="font-medium">{client.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p className="font-medium">{client.email}</p>
          </div>
          {client.phone && (
            <div>
              <label className="text-sm text-gray-500">Telefone</label>
              <p className="font-medium">{client.phone}</p>
            </div>
          )}
          {client.birthDate && (
            <div>
              <label className="text-sm text-gray-500">Data de Nascimento</label>
              <p className="font-medium">
                {new Date(client.birthDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
          {client.gender && (
            <div>
              <label className="text-sm text-gray-500">Gênero</label>
              <p className="font-medium capitalize">{client.gender}</p>
            </div>
          )}
          {client.address && (
            <div className="col-span-2">
              <label className="text-sm text-gray-500">Endereço</label>
              <p className="font-medium">{client.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total de Agendamentos</p>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Gasto</p>
          <p className="text-2xl font-bold">R$ -</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Última Visita</p>
          <p className="text-2xl font-bold">-</p>
        </div>
      </div>

      {/* Observações */}
      {client.notes && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Observações</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
        </div>
      )}
    </div>
  );
}
```

**Checklist:**
```
□ Arquivo criado
□ Interface Client definida
□ Props tipadas corretamente
□ Layout responsivo (grid)
□ Campos condicionais (phone, birthDate, etc)
□ Sem erros TypeScript
```

##### 2. ClientNotesTab.tsx (45 min)

```tsx
// app/src/client/modules/clients/components/ClientNotesTab.tsx
import React, { useState } from 'react';
import { useQuery } from '@wasp/queries';
import { addClientNote, updateClientNote, deleteClientNote } from '@wasp/actions';
import { getClientNotes } from '@wasp/queries';

interface ClientNotesTabProps {
  clientId: number;
}

export default function ClientNotesTab({ clientId }: ClientNotesTabProps) {
  const { data: notes, isLoading } = useQuery(getClientNotes, { clientId });
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await addClientNote({ clientId, content: newNote });
      setNewNote('');
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Deseja realmente excluir esta nota?')) return;
    
    try {
      await deleteClientNote({ noteId });
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
    }
  };

  if (isLoading) return <div>Carregando notas...</div>;

  return (
    <div className="space-y-4">
      {/* Formulário de Nova Nota */}
      <div className="bg-white rounded-lg shadow p-4">
        <textarea
          className="w-full border rounded-md p-3 min-h-[100px]"
          placeholder="Adicionar nova nota..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleAddNote}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Adicionar Nota
          </button>
        </div>
      </div>

      {/* Lista de Notas */}
      <div className="space-y-3">
        {notes?.map((note: any) => (
          <div key={note.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(note.createdAt).toLocaleString('pt-BR')}
                  {note.user && ` • ${note.user.name}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingNoteId(note.id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notes?.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          Nenhuma nota adicionada ainda.
        </p>
      )}
    </div>
  );
}
```

**Checklist:**
```
□ Arquivo criado
□ useQuery importado e usado
□ Actions importadas (add, update, delete)
□ Estado local para nova nota
□ Formulário de criação funcional
□ Lista de notas renderizada
□ Edição implementada (se tempo permitir)
□ Deleção com confirmação
□ Sem erros TypeScript
```

##### 3. ClientDocumentsTab.tsx (45 min)

```tsx
// app/src/client/modules/clients/components/ClientDocumentsTab.tsx
import React, { useState } from 'react';
import { useQuery } from '@wasp/queries';
import { uploadClientDocument, deleteClientDocument } from '@wasp/actions';
import { getClientDocuments } from '@wasp/queries';

interface ClientDocumentsTabProps {
  clientId: number;
}

export default function ClientDocumentsTab({ clientId }: ClientDocumentsTabProps) {
  const { data: documents, isLoading } = useQuery(getClientDocuments, { clientId });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Implementar upload aqui
      // await uploadClientDocument({ clientId, file });
      console.log('Upload:', file.name);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!confirm('Deseja realmente excluir este documento?')) return;
    
    try {
      await deleteClientDocument({ documentId: docId });
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
    }
  };

  if (isLoading) return <div>Carregando documentos...</div>;

  return (
    <div className="space-y-4">
      {/* Upload de Documento */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Adicionar Documento
          </span>
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="mt-2 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </label>
        {uploading && <p className="text-sm text-gray-500 mt-2">Enviando...</p>}
      </div>

      {/* Lista de Documentos */}
      <div className="space-y-3">
        {documents?.map((doc: any) => (
          <div key={doc.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{doc.name || 'Documento sem nome'}</p>
              <p className="text-sm text-gray-500">
                Enviado em {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.open(doc.url, '_blank')}
                className="px-3 py-1 text-blue-600 hover:text-blue-800"
              >
                Baixar
              </button>
              <button
                onClick={() => handleDeleteDocument(doc.id)}
                className="px-3 py-1 text-red-600 hover:text-red-800"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {documents?.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          Nenhum documento enviado ainda.
        </p>
      )}
    </div>
  );
}
```

**Checklist:**
```
□ Arquivo criado
□ useQuery para documentos
□ Input de file upload
□ Loading state durante upload
□ Lista de documentos
□ Download de documento
□ Deleção com confirmação
□ Sem erros TypeScript
```

##### 4. ClientHistoryTab.tsx (30 min)

```tsx
// app/src/client/modules/clients/components/ClientHistoryTab.tsx
import React from 'react';
import { useQuery } from '@wasp/queries';
import { getClientHistory } from '@wasp/queries';

interface ClientHistoryTabProps {
  clientId: number;
}

export default function ClientHistoryTab({ clientId }: ClientHistoryTabProps) {
  const { data: history, isLoading } = useQuery(getClientHistory, { clientId });

  if (isLoading) return <div>Carregando histórico...</div>;

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative">
        {history?.map((event: any, index: number) => (
          <div key={event.id} className="flex gap-4 pb-8">
            {/* Linha da timeline */}
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${
                event.type === 'appointment' ? 'bg-blue-600' :
                event.type === 'sale' ? 'bg-green-600' :
                event.type === 'note' ? 'bg-yellow-600' :
                'bg-gray-600'
              }`} />
              {index < history.length - 1 && (
                <div className="w-0.5 h-full bg-gray-300 mt-2" />
              )}
            </div>

            {/* Conteúdo do evento */}
            <div className="flex-1 bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(event.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {history?.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          Nenhum histórico registrado ainda.
        </p>
      )}
    </div>
  );
}
```

**Checklist:**
```
□ Arquivo criado
□ useQuery para histórico
□ Timeline visual implementada
□ Cores por tipo de evento
□ Formatação de data
□ Estado vazio tratado
□ Sem erros TypeScript
```

---

#### SUBTAREFA 1.1.4: Atualizar ClientDetailPage (2 horas)

```tsx
// app/src/client/modules/clients/ClientDetailPage.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@wasp/queries';
import { getClient } from '@wasp/queries';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ClientOverviewTab from './components/ClientOverviewTab';
import ClientNotesTab from './components/ClientNotesTab';
import ClientDocumentsTab from './components/ClientDocumentsTab';
import ClientHistoryTab from './components/ClientHistoryTab';

export default function ClientDetailPage() {
  const { id } = useParams();
  const clientId = parseInt(id!);
  
  const { data: client, isLoading, error } = useQuery(getClient, { id: clientId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Cliente não encontrado</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm">
        <Link to="/clients" className="text-blue-600 hover:text-blue-800">
          Clientes
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <span className="text-gray-700">{client.name}</span>
      </nav>

      {/* Header do Cliente */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {client.name.charAt(0).toUpperCase()}
            </div>
            
            {/* Info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
              <p className="text-gray-600">{client.email}</p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              Editar
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Novo Agendamento
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="notes">Notas</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ClientOverviewTab client={client} />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <ClientNotesTab clientId={clientId} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <ClientDocumentsTab clientId={clientId} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <ClientHistoryTab clientId={clientId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**Checklist:**
```
□ Arquivo atualizado
□ useParams para obter ID
□ useQuery para buscar cliente
□ Loading state implementado
□ Error state implementado
□ Breadcrumb funcional
□ Header com avatar e info
□ Botões de ação
□ Tabs importados e configurados
□ Todos os componentes de aba importados
□ Sem erros TypeScript
```

---

#### SUBTAREFA 1.1.5: Descomentar Rota no main.wasp (5 min)

```wasp
// app/main.wasp
// Procurar por (aproximadamente linha 1030):

// route ClientDetailRoute { path: "/clients/:id", to: ClientDetailPage }
// page ClientDetailPage {
//   authRequired: true,
//   component: import ClientDetail from "@src/client/modules/clients/ClientDetailPage"
// }

// ALTERAR PARA:

route ClientDetailRoute { path: "/clients/:id", to: ClientDetailPage }
page ClientDetailPage {
  authRequired: true,
  component: import ClientDetail from "@src/client/modules/clients/ClientDetailPage"
}
```

**Checklist:**
```
□ Localizar rota comentada
□ Remover comentários (//)
□ Salvar arquivo main.wasp
□ Reiniciar servidor Wasp (wasp start)
□ Aguardar compilação
```

**Comandos:**
```bash
# Terminal 1: Parar servidor (Ctrl+C)
# Terminal 1: Reiniciar
□ wasp start

# Aguardar mensagens:
# ✓ Server started on http://localhost:3001
# ✓ Client started on http://localhost:3000
```

---

#### VALIDAÇÃO FINAL TAREFA 1.1 (30 min)

**Teste Manual Completo:**

```
1. Acessar Aplicação:
   □ Abrir http://localhost:3000
   □ Fazer login
   □ Navegar para /clients

2. Testar Navegação:
   □ Clicar em um cliente da lista
   □ URL muda para /clients/:id
   □ Página carrega sem erro

3. Testar Aba "Visão Geral":
   □ Dados do cliente exibidos corretamente
   □ Estatísticas aparecem (mesmo que vazias)
   □ Layout responsivo

4. Testar Aba "Notas":
   □ Formulário de nova nota aparece
   □ Criar nova nota funciona
   □ Lista de notas exibe
   □ Editar nota funciona (se implementado)
   □ Excluir nota funciona

5. Testar Aba "Documentos":
   □ Input de arquivo aparece
   □ Upload funciona (ou mostra mensagem)
   □ Lista de documentos exibe
   □ Download funciona
   □ Excluir documento funciona

6. Testar Aba "Histórico":
   □ Timeline exibe
   □ Eventos aparecem (se houver)
   □ Formatação correta

7. Verificar Console:
   □ Sem erros no console do navegador
   □ Sem warnings críticos
   □ Requests ao backend funcionando

8. Testar Responsividade:
   □ Mobile (< 768px)
   □ Tablet (768px - 1024px)
   □ Desktop (> 1024px)
```

**Checklist de Qualidade:**
```
□ TypeScript sem erros (0 erros no terminal)
□ ESLint warnings resolvidos (se possível)
□ Código formatado consistentemente
□ Componentes reutilizáveis criados
□ Loading states implementados
□ Error handling presente
□ UX suave e responsiva
```

**Commit:**
```bash
□ git add .
□ git commit -m "feat: implementa detalhes de cliente com tabs (notas, documentos, histórico)"
□ git push origin main
```

---

### TAREFA 1.2: Rotas Financeiras

**Estimativa:** 8 horas  
**Prioridade:** 🔴 CRÍTICA

#### SUBTAREFA 1.2.1: Adicionar Rotas no main.wasp (15 min)

Localizar seção de rotas financeiras (ou criar nova seção) no `app/main.wasp`:

```wasp
// ============================================================================
// MÓDULO FINANCEIRO
// ============================================================================

route FinancialDashboardRoute { path: "/financial/dashboard", to: FinancialDashboardPage }
page FinancialDashboardPage {
  authRequired: true,
  component: import FinancialDashboard from "@src/client/modules/financial/FinancialDashboard"
}

route AccountsReceivableRoute { path: "/financial/receivables", to: AccountsReceivablePage }
page AccountsReceivablePage {
  authRequired: true,
  component: import AccountsReceivable from "@src/client/modules/financial/AccountsReceivablePage"
}

route AccountsPayableRoute { path: "/financial/payables", to: AccountsPayablePage }
page AccountsPayablePage {
  authRequired: true,
  component: import AccountsPayable from "@src/client/modules/financial/AccountsPayablePage"
}

route ExpensesRoute { path: "/financial/expenses", to: ExpensesPage }
page ExpensesPage {
  authRequired: true,
  component: import Expenses from "@src/client/modules/financial/ExpensesPage"
}

route BudgetsRoute { path: "/financial/budgets", to: BudgetsPage }
page BudgetsPage {
  authRequired: true,
  component: import Budgets from "@src/client/modules/financial/BudgetsPage"
}

route CategoriesRoute { path: "/financial/categories", to: CategoriesPage }
page CategoriesPage {
  authRequired: true,
  component: import Categories from "@src/client/modules/financial/CategoriesPage"
}
```

**Checklist:**
```
□ Rotas adicionadas no main.wasp
□ Paths corretos (/financial/*)
□ authRequired: true em todas
□ Imports dos componentes corretos
□ Arquivo salvo
```

---

#### SUBTAREFA 1.2.2: Criar BudgetsPage (2 horas)

```tsx
// app/src/client/modules/financial/BudgetsPage.tsx
import React, { useState } from 'react';
import { useQuery } from '@wasp/queries';
import { createBudget, updateBudget, deleteBudget } from '@wasp/actions';
import { listBudgets, getBudget } from '@wasp/queries';

export default function BudgetsPage() {
  const { data: budgets, isLoading } = useQuery(listBudgets);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orçamentos</h1>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Novo Orçamento
        </button>
      </div>

      {isLoading ? (
        <div>Carregando orçamentos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets?.map((budget: any) => (
            <BudgetCard key={budget.id} budget={budget} />
          ))}
        </div>
      )}

      {budgets?.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Nenhum orçamento criado ainda.
        </div>
      )}

      {showCreateDialog && (
        <CreateBudgetDialog onClose={() => setShowCreateDialog(false)} />
      )}
    </div>
  );
}

// Componente de Card de Orçamento
function BudgetCard({ budget }: { budget: any }) {
  const percentUsed = (budget.spent / budget.amount) * 100;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold text-lg mb-2">{budget.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{budget.category}</p>
      
      {/* Barra de Progresso */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>R$ {budget.spent.toFixed(2)}</span>
          <span>R$ {budget.amount.toFixed(2)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              percentUsed > 100 ? 'bg-red-600' :
              percentUsed > 80 ? 'bg-yellow-600' :
              'bg-green-600'
            }`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {percentUsed.toFixed(1)}% utilizado
        </p>
      </div>

      {/* Período */}
      <p className="text-sm text-gray-600">
        {new Date(budget.startDate).toLocaleDateString('pt-BR')} até{' '}
        {new Date(budget.endDate).toLocaleDateString('pt-BR')}
      </p>
    </div>
  );
}

// Dialog de Criação
function CreateBudgetDialog({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: 0,
    startDate: '',
    endDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBudget(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Novo Orçamento</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              required
              className="w-full border rounded-md p-2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <input
              type="text"
              required
              className="w-full border rounded-md p-2"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Valor</label>
            <input
              type="number"
              required
              step="0.01"
              className="w-full border rounded-md p-2"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data Início</label>
              <input
                type="date"
                required
                className="w-full border rounded-md p-2"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Fim</label>
              <input
                type="date"
                required
                className="w-full border rounded-md p-2"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Criar Orçamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

**Checklist:**
```
□ Arquivo criado
□ useQuery para listBudgets
□ Actions importadas
□ Grid de cards responsivo
□ Barra de progresso visual
□ Cores dinâmicas (verde/amarelo/vermelho)
□ Dialog de criação
□ Formulário completo
□ Validação de datas
□ Sem erros TypeScript
```

---

#### SUBTAREFA 1.2.3: Criar CategoriesPage (1 hora)

```tsx
// app/src/client/modules/financial/CategoriesPage.tsx
import React, { useState } from 'react';
import { useQuery } from '@wasp/queries';
import { createFinancialCategory, updateFinancialCategory, deleteFinancialCategory } from '@wasp/actions';
import { listFinancialCategories } from '@wasp/queries';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery(listFinancialCategories);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir esta categoria?')) return;
    
    try {
      await deleteFinancialCategory({ id });
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categorias Financeiras</h1>
        <button
          onClick={() => { setEditingCategory(null); setShowDialog(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Nova Categoria
        </button>
      </div>

      {isLoading ? (
        <div>Carregando categorias...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Descrição
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories?.map((category: any) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: category.color || '#3B82F6' }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      category.type === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {category.type === 'INCOME' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => { setEditingCategory(category); setShowDialog(true); }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDialog && (
        <CategoryDialog
          category={editingCategory}
          onClose={() => setShowDialog(false)}
        />
      )}
    </div>
  );
}

function CategoryDialog({ category, onClose }: { category: any; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    type: category?.type || 'EXPENSE',
    description: category?.description || '',
    color: category?.color || '#3B82F6',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (category) {
        await updateFinancialCategory({ id: category.id, ...formData });
      } else {
        await createFinancialCategory(formData);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">
          {category ? 'Editar' : 'Nova'} Categoria
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              required
              className="w-full border rounded-md p-2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              required
              className="w-full border rounded-md p-2"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <option value="INCOME">Receita</option>
              <option value="EXPENSE">Despesa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cor</label>
            <input
              type="color"
              className="w-full border rounded-md p-1 h-10"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              className="w-full border rounded-md p-2"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

**Checklist:**
```
□ Arquivo criado
□ Listagem em tabela
□ CRUD completo (create, update, delete)
□ Color picker para categoria
□ Tipo (receita/despesa)
□ Dialog de edição/criação
□ Confirmação de deleção
□ Sem erros TypeScript
```

---

#### SUBTAREFA 1.2.4: Reiniciar Servidor e Testar (30 min)

```bash
# Parar servidor Wasp (Ctrl+C)
□ Parar servidor

# Reiniciar
□ wasp start

# Aguardar compilação completa
```

**Teste Manual:**
```
1. Acessar /financial/dashboard
   □ Página carrega
   □ Dados exibidos

2. Acessar /financial/receivables
   □ Página carrega
   □ Contas a receber listadas

3. Acessar /financial/payables
   □ Página carrega
   □ Contas a pagar listadas

4. Acessar /financial/expenses
   □ Página carrega
   □ Despesas listadas

5. Acessar /financial/budgets
   □ Página carrega
   □ Criar orçamento funciona
   □ Cards exibem progresso

6. Acessar /financial/categories
   □ Página carrega
   □ Criar categoria funciona
   □ Editar categoria funciona
   □ Deletar categoria funciona

7. Console do Navegador
   □ Sem erros
   □ Requests bem-sucedidos
```

---

**CONTINUAÇÃO NO PRÓXIMO DOCUMENTO...**

Este checklist continua com as Fases 2, 3 e 4. Deseja que eu continue com o restante?
