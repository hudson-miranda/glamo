
import React from 'react';
import { useQuery } from 'wasp/client/operations';
import { listLoyaltyPrograms, getLoyaltyProgramStats } from 'wasp/client/operations';

export default function LoyaltyProgramPage() {
  const { data: programs, isLoading } = useQuery(listLoyaltyPrograms, {
    salonId: 'current-salon-id' // Would come from context
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Programa de Fidelidade</h1>
        <p className="text-gray-600">Gerencie programas de cashback e tiers VIP</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total de Membros</h3>
          <p className="text-3xl font-bold text-primary-600">
            {programs?.reduce((sum, p) => sum + p._count.balances, 0) || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Cashback Emitido</h3>
          <p className="text-3xl font-bold text-green-600">R$ 0,00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Programas Ativos</h3>
          <p className="text-3xl font-bold text-blue-600">
            {programs?.filter(p => p.isActive).length || 0}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Programas de Fidelidade</h2>
        </div>
        <div className="p-6">
          {programs && programs.length > 0 ? (
            <div className="space-y-4">
              {programs.map((program) => (
                <div key={program.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{program.name}</h3>
                      <p className="text-gray-600 mt-1">{program.description}</p>
                      <div className="mt-3 flex gap-4 text-sm">
                        <span>
                          Cashback: {program.cashbackType === 'PERCENTAGE' ? `${program.cashbackValue}%` : `R$ ${program.cashbackValue}`}
                        </span>
                        <span>VIP Tiers: {program.vipTiersEnabled ? 'Ativo' : 'Inativo'}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${program.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {program.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum programa cadastrado</p>
          )}
        </div>
      </div>
    </div>
  );
}
