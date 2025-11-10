
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

export default function ClientSegmentsPage() {
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Segmentos de Clientes</h1>
          <p className="text-gray-600 mt-1">Crie grupos de clientes para campanhas direcionadas</p>
        </div>
        <Button>Novo Segmento</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Segmentos</CardTitle>
          <CardDescription>Lista de segmentos de clientes criados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold">Em breve</h3>
            <p className="mt-2 text-sm text-gray-600">
              A funcionalidade de segmentos estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
