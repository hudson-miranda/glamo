
import React from 'react';
import { useQuery } from 'wasp/client/operations';
import { listAnamnesisForms } from 'wasp/client/operations';

export default function AnamnesisFormsPage() {
  const { data: forms, isLoading } = useQuery(listAnamnesisForms, {
    salonId: 'current-salon-id', // Would come from context
    isActive: true
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Formulários de Anamnese</h1>
          <p className="text-gray-600">Gerencie formulários e anamneses de clientes</p>
        </div>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          + Novo Formulário
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {forms && forms.length > 0 ? (
            <div className="space-y-4">
              {forms.map((form) => (
                <div key={form.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{form.name}</h3>
                        {form.isDefault && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            Padrão
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded ${form.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {form.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{form.description}</p>
                      <div className="mt-3 flex gap-4 text-sm text-gray-600">
                        <span>📝 {form._count?.submissions || 0} preenchimentos</span>
                        <span>✍️ {form.requireSignature ? 'Requer assinatura' : 'Sem assinatura'}</span>
                        <span>📋 Versão {form.version}</span>
                      </div>
                      {form.serviceCategories && form.serviceCategories.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {form.serviceCategories.map((cat) => (
                            <span key={cat} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">Nenhum formulário cadastrado</p>
              <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Criar Primeiro Formulário
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
