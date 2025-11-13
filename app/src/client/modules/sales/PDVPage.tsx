import { useState, useMemo } from 'react';
import { useQuery, listClients, listServices, listProducts, listEmployees, createSale } from 'wasp/client/operations';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Search, 
  User,
  Package,
  Scissors,
  DollarSign,
  Check,
  X
} from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { useToast } from '../../../components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';

type CartItem = {
  id: string;
  type: 'service' | 'product';
  name: string;
  price: number;
  quantity: number;
  discount: number;
  professionalId?: string;
  professionalName?: string;
  variantId?: string;
  variantName?: string;
  originalData: any;
};

export default function PDVPage() {
  const { activeSalonId } = useSalonContext();
  const { toast } = useToast();

  // State
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');

  // Queries
  const { data: clientsData } = useQuery(listClients, {
    salonId: activeSalonId || '',
    page: 1,
    perPage: 100,
  }, {
    enabled: !!activeSalonId,
  });

  const { data: servicesData } = useQuery(listServices, {
    salonId: activeSalonId || '',
  }, {
    enabled: !!activeSalonId,
  });

  const { data: productsData } = useQuery(listProducts, {
    salonId: activeSalonId || '',
  }, {
    enabled: !!activeSalonId,
  });

  const { data: employeesData } = useQuery(listEmployees, {
    salonId: activeSalonId || '',
  }, {
    enabled: !!activeSalonId,
  });

  // Filter services and products by search
  const filteredServices = useMemo(() => {
    if (!servicesData?.services) return [];
    if (!searchQuery) return servicesData.services;
    return servicesData.services.filter((service: any) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [servicesData, searchQuery]);

  const filteredProducts = useMemo(() => {
    if (!productsData?.products) return [];
    if (!searchQuery) return productsData.products;
    return productsData.products.filter((product: any) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [productsData, searchQuery]);

  // Calculate totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const itemDiscount = item.discount;
      return sum + (itemTotal - itemDiscount);
    }, 0);
  }, [cart]);

  const globalDiscount = useMemo(() => {
    if (discountType === 'percentage') {
      return (subtotal * discount) / 100;
    }
    return discount;
  }, [subtotal, discount, discountType]);

  const total = subtotal - globalDiscount;

  // Cart functions
  const addToCart = (item: any, type: 'service' | 'product') => {
    if (type === 'service' && !selectedProfessional) {
      toast({
        title: 'Erro',
        description: 'Selecione um profissional antes de adicionar um serviço',
        variant: 'destructive',
      });
      return;
    }

    const cartItem: CartItem = {
      id: `${type}-${item.id}-${Date.now()}`,
      type,
      name: item.name,
      price: item.price,
      quantity: 1,
      discount: 0,
      professionalId: type === 'service' ? selectedProfessional : undefined,
      professionalName: type === 'service' ? 'Profissional' : undefined,
      originalData: item,
    };

    setCart([...cart, cartItem]);
    toast({
      title: 'Adicionado ao carrinho',
      description: `${item.name} foi adicionado`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(cart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const updateItemDiscount = (itemId: string, discount: number) => {
    setCart(cart.map(item =>
      item.id === itemId ? { ...item, discount: Math.max(0, discount) } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setNotes('');
    setSelectedClient('');
  };

  const handleFinalizeSale = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Carrinho vazio',
        description: 'Adicione itens ao carrinho antes de finalizar',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedProfessional) {
      toast({
        title: 'Profissional não selecionado',
        description: 'Selecione um profissional para continuar',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const services = cart
        .filter(item => item.type === 'service')
        .map(item => ({
          serviceId: item.originalData.id,
          professionalId: item.professionalId!,
          discount: item.discount,
        }));

      const products = cart
        .filter(item => item.type === 'product')
        .map(item => ({
          productId: item.originalData.id,
          quantity: item.quantity,
          discount: item.discount,
        }));

      await createSale({
        salonId: activeSalonId!,
        clientId: selectedClient || undefined,
        employeeId: selectedProfessional,
        services,
        products,
        notes,
      });

      toast({
        title: 'Venda finalizada com sucesso!',
        description: `Total: R$ ${total.toFixed(2)}`,
      });

      clearCart();
    } catch (error: any) {
      toast({
        title: 'Erro ao finalizar venda',
        description: error.message || 'Tente novamente',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-4 p-4">
      {/* Left Panel - Products/Services */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Search and Professional Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Ponto de Venda (PDV)</CardTitle>
            <CardDescription>Adicione produtos e serviços ao carrinho</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Profissional *</Label>
                <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {employeesData?.employees?.map((employee: any) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.user?.email || employee.email || 'Funcionário'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cliente (opcional)</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsData?.clients?.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos ou serviços..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products and Services Tabs */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="services" className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="services">
                  <Scissors className="h-4 w-4 mr-2" />
                  Serviços ({filteredServices.length})
                </TabsTrigger>
                <TabsTrigger value="products">
                  <Package className="h-4 w-4 mr-2" />
                  Produtos ({filteredProducts.length})
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto">
              <TabsContent value="services" className="mt-0 space-y-2">
                {filteredServices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Scissors className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum serviço encontrado</p>
                  </div>
                ) : (
                  filteredServices.map((service: any) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => addToCart(service, 'service')}
                    >
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.duration} min
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatCurrency(service.price)}</span>
                        <Button size="sm" variant="ghost">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="products" className="mt-0 space-y-2">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum produto encontrado</p>
                  </div>
                ) : (
                  filteredProducts.map((product: any) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => addToCart(product, 'product')}
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Estoque: {product.quantity || 0}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatCurrency(product.price)}</span>
                        <Button size="sm" variant="ghost">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-[420px] flex flex-col gap-4">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                <ShoppingCart className="h-5 w-5 inline mr-2" />
                Carrinho ({cart.length})
              </CardTitle>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCart}>
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto space-y-2">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="h-16 w-16 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">Carrinho vazio</p>
                <p className="text-sm">Adicione produtos ou serviços</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {item.type === 'service' ? 'Serviço' : 'Produto'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || item.type === 'service'}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.type === 'service'}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Desconto:</Label>
                    <Input
                      type="number"
                      value={item.discount}
                      onChange={(e) => updateItemDiscount(item.id, parseFloat(e.target.value) || 0)}
                      className="h-7 text-sm"
                      placeholder="R$ 0,00"
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>

          <Separator />

          {/* Totals */}
          <CardContent className="space-y-3 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm">Desconto:</Label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="h-8 flex-1"
                  placeholder="0"
                />
                <Select value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
                  <SelectTrigger className="h-8 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">%</SelectItem>
                    <SelectItem value="fixed">R$</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Desconto aplicado:</span>
                <span>- {formatCurrency(globalDiscount)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-green-600">{formatCurrency(total)}</span>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Observações:</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações opcionais..."
                className="h-8"
              />
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleFinalizeSale}
              disabled={isProcessing || cart.length === 0 || !selectedProfessional}
            >
              {isProcessing ? (
                <>Processando...</>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Finalizar Venda
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
