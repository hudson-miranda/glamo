import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalonContext } from '../../hooks/useSalonContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import {
  FileText,
  Plus,
  Save,
  Eye,
  Copy,
  Trash2,
  Edit3,
  Search,
  Filter,
  Clock,
  User,
  Calendar,
  Download,
  Upload,
  FileSignature,
  Type,
  Image as ImageIcon,
  CheckSquare,
  AlignLeft,
  List,
  ChevronRight,
  BarChart3,
} from 'lucide-react';

// Template categories
const TEMPLATE_CATEGORIES = {
  CONSENT: 'Termos de Consentimento',
  CONTRACT: 'Contratos',
  ANAMNESIS: 'Formulários de Anamnese',
  PRESCRIPTION: 'Receitas',
  CERTIFICATE: 'Certificados',
  OTHER: 'Outros',
};

// Field types for templates
const FIELD_TYPES = {
  TEXT: { label: 'Texto', icon: Type },
  TEXTAREA: { label: 'Texto Longo', icon: AlignLeft },
  DATE: { label: 'Data', icon: Calendar },
  SIGNATURE: { label: 'Assinatura', icon: FileSignature },
  CHECKBOX: { label: 'Checkbox', icon: CheckSquare },
  SELECT: { label: 'Seleção', icon: List },
  IMAGE: { label: 'Imagem', icon: ImageIcon },
};

// Template field interface
interface TemplateField {
  id: string;
  type: keyof typeof FIELD_TYPES;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select fields
  defaultValue?: string;
}

// Template interface
interface Template {
  id: string;
  name: string;
  category: keyof typeof TEMPLATE_CATEGORIES;
  description: string;
  content: string;
  fields: TemplateField[];
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export default function TemplateEditorPage() {
  const { activeSalonId } = useSalonContext();
  const navigate = useNavigate();
  
  // Templates state (mock data - in production: use queries)
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Termo de Consentimento - Botox',
      category: 'CONSENT',
      description: 'Termo de consentimento padrão para aplicação de toxina botulínica',
      content: 'Eu, [NOME_CLIENTE], portador(a) do CPF [CPF_CLIENTE], declaro estar ciente dos procedimentos...',
      fields: [
        { id: 'f1', type: 'TEXT', label: 'Nome do Cliente', required: true },
        { id: 'f2', type: 'TEXT', label: 'CPF', required: true },
        { id: 'f3', type: 'DATE', label: 'Data do Procedimento', required: true },
        { id: 'f4', type: 'SIGNATURE', label: 'Assinatura do Cliente', required: true },
      ],
      usageCount: 145,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-11-01'),
      isActive: true,
    },
    {
      id: '2',
      name: 'Contrato de Serviços Estéticos',
      category: 'CONTRACT',
      description: 'Contrato padrão para serviços estéticos em geral',
      content: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS ESTÉTICOS\n\nCONTRATANTE: [NOME_CLIENTE]...',
      fields: [
        { id: 'f1', type: 'TEXT', label: 'Nome do Cliente', required: true },
        { id: 'f2', type: 'TEXTAREA', label: 'Serviços Contratados', required: true },
        { id: 'f3', type: 'TEXT', label: 'Valor Total', required: true },
        { id: 'f4', type: 'DATE', label: 'Data de Início', required: true },
        { id: 'f5', type: 'SIGNATURE', label: 'Assinatura do Cliente', required: true },
        { id: 'f6', type: 'SIGNATURE', label: 'Assinatura do Responsável', required: true },
      ],
      usageCount: 89,
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-10-15'),
      isActive: true,
    },
  ]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState<keyof typeof TEMPLATE_CATEGORIES>('OTHER');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
  
  // Preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  
  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  
  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && template.isActive) ||
      (statusFilter === 'inactive' && !template.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Statistics
  const stats = {
    total: templates.length,
    active: templates.filter(t => t.isActive).length,
    totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0),
    mostUsed: templates.reduce((max, t) => t.usageCount > max.usageCount ? t : max, templates[0]),
  };
  
  // Open editor for new template
  const openNewTemplate = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateCategory('OTHER');
    setTemplateDescription('');
    setTemplateContent('');
    setTemplateFields([]);
    setEditorOpen(true);
  };
  
  // Open editor for existing template
  const openEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateCategory(template.category);
    setTemplateDescription(template.description);
    setTemplateContent(template.content);
    setTemplateFields([...template.fields]);
    setEditorOpen(true);
  };
  
  // Save template
  const handleSaveTemplate = () => {
    if (!templateName || !templateContent) {
      alert('Preencha o nome e o conteúdo do template');
      return;
    }
    
    if (editingTemplate) {
      // Update existing template
      setTemplates(templates.map(t => 
        t.id === editingTemplate.id
          ? {
              ...t,
              name: templateName,
              category: templateCategory,
              description: templateDescription,
              content: templateContent,
              fields: templateFields,
              updatedAt: new Date(),
            }
          : t
      ));
      alert('Template atualizado com sucesso!');
    } else {
      // Create new template
      const newTemplate: Template = {
        id: Date.now().toString(),
        name: templateName,
        category: templateCategory,
        description: templateDescription,
        content: templateContent,
        fields: templateFields,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };
      setTemplates([...templates, newTemplate]);
      alert('Template criado com sucesso!');
    }
    
    setEditorOpen(false);
  };
  
  // Add field to template
  const addField = (type: keyof typeof FIELD_TYPES) => {
    const newField: TemplateField = {
      id: Date.now().toString(),
      type,
      label: `Novo Campo ${FIELD_TYPES[type].label}`,
      required: false,
    };
    setTemplateFields([...templateFields, newField]);
  };
  
  // Update field
  const updateField = (id: string, updates: Partial<TemplateField>) => {
    setTemplateFields(templateFields.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ));
  };
  
  // Remove field
  const removeField = (id: string) => {
    setTemplateFields(templateFields.filter(f => f.id !== id));
  };
  
  // Duplicate template
  const duplicateTemplate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Cópia)`,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTemplates([...templates, newTemplate]);
    alert('Template duplicado com sucesso!');
  };
  
  // Delete template
  const handleDeleteTemplate = () => {
    if (!templateToDelete) return;
    
    setTemplates(templates.filter(t => t.id !== templateToDelete.id));
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
    alert('Template excluído com sucesso!');
  };
  
  // Toggle template status
  const toggleTemplateStatus = (id: string) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ));
  };
  
  // Insert placeholder in content
  const insertPlaceholder = (fieldId: string) => {
    const field = templateFields.find(f => f.id === fieldId);
    if (!field) return;
    
    const placeholder = `[${field.label.toUpperCase().replace(/\s+/g, '_')}]`;
    setTemplateContent(templateContent + placeholder);
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Editor de Templates</h1>
        <p className="text-muted-foreground">
          Crie e gerencie templates reutilizáveis para documentos, contratos e formulários
        </p>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.active} ativos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Usos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsage}</div>
            <p className="text-xs text-muted-foreground mt-1">
              em todos os templates
            </p>
          </CardContent>
        </Card>
        
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mais Utilizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{stats.mostUsed?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {stats.mostUsed?.usageCount} usos
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters & Actions */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filtros e Ações</CardTitle>
            <Button onClick={openNewTemplate}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome ou descrição..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            {/* Category */}
            <div>
              <Label>Categoria</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {Object.entries(TEMPLATE_CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Status */}
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Templates List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{template.name}</CardTitle>
                    <Badge variant={template.isActive ? 'default' : 'secondary'}>
                      {template.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant="outline">
                      {TEMPLATE_CATEGORIES[template.category]}
                    </Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPreviewTemplate(template);
                      setPreviewOpen(true);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditTemplate(template)}
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateTemplate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTemplateToDelete(template);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>{template.usageCount} usos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    <span>{template.fields.length} campos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Atualizado em {template.updatedAt.toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTemplateStatus(template.id)}
                >
                  {template.isActive ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p className="font-medium mb-2">Nenhum template encontrado</p>
                <Button onClick={openNewTemplate} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Template
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Template Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
            <DialogDescription>
              Configure o template com campos dinâmicos e conteúdo personalizado
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome do Template *</Label>
                <Input
                  placeholder="Ex: Termo de Consentimento - Botox"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              
              <div>
                <Label>Categoria *</Label>
                <Select value={templateCategory} onValueChange={(val) => setTemplateCategory(val as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TEMPLATE_CATEGORIES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descreva o propósito deste template..."
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                rows={2}
              />
            </div>
            
            {/* Fields */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Campos do Template</Label>
                <div className="flex gap-2">
                  {Object.entries(FIELD_TYPES).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        onClick={() => addField(key as any)}
                      >
                        <Icon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                {templateFields.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum campo adicionado. Clique nos botões acima para adicionar campos.
                  </p>
                ) : (
                  templateFields.map((field) => {
                    const Icon = FIELD_TYPES[field.type].icon;
                    return (
                      <div key={field.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <Icon className="h-4 w-4 text-primary" />
                        <Input
                          placeholder="Nome do campo"
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="flex-1"
                        />
                        <label className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          />
                          Obrigatório
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => insertPlaceholder(field.id)}
                        >
                          Inserir
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeField(field.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* Content */}
            <div>
              <Label>Conteúdo do Template *</Label>
              <Textarea
                placeholder="Digite o conteúdo do template. Use [NOME_CAMPO] para inserir placeholders."
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use placeholders como [NOME_CLIENTE], [DATA], [ASSINATURA] que serão substituídos pelos valores dos campos.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTemplate}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visualizar Template</DialogTitle>
            <DialogDescription>
              {previewTemplate?.name}
            </DialogDescription>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Informações</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Categoria:</span>
                    <span className="ml-2">{TEMPLATE_CATEGORIES[previewTemplate.category]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Usos:</span>
                    <span className="ml-2">{previewTemplate.usageCount}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Campos ({previewTemplate.fields.length})</h3>
                <div className="space-y-2">
                  {previewTemplate.fields.map((field) => {
                    const Icon = FIELD_TYPES[field.type].icon;
                    return (
                      <div key={field.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <Icon className="h-4 w-4" />
                        <span className="flex-1">{field.label}</span>
                        {field.required && (
                          <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {FIELD_TYPES[field.type].label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Conteúdo</h3>
                <div className="bg-white border rounded-lg p-4 whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
                  {previewTemplate.content}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              setPreviewOpen(false);
              if (previewTemplate) openEditTemplate(previewTemplate);
            }}>
              <Edit3 className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {templateToDelete && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">{templateToDelete.name}</p>
              <p className="text-sm text-muted-foreground">
                {templateToDelete.usageCount} usos registrados
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
