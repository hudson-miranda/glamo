
import React from 'react';
import { useQuery } from 'wasp/client/operations';
import { getSalonDashboard, getRetentionAnalytics, getClientChurnRisk, getTopClients } from 'wasp/client/operations';

export default function AnalyticsDashboard() {
  const salonId = 'current-salon-id'; // Would come from context
  
  const { data: dashboard, isLoading: loadingDashboard } = useQuery(getSalonDashboard, { salonId, period: 'MONTHLY' });
  const { data: retention, isLoading: loadingRetention } = useQuery(getRetentionAnalytics, { salonId });
  const { data: atRisk, isLoading: loadingRisk } = useQuery(getClientChurnRisk, { salonId, minRisk: 60, limit: 5 });
  const { data: topClients, isLoading: loadingTop } = useQuery(getTopClients, { salonId, orderBy: 'revenue', limit: 5 });

  if (loadingDashboard) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics Avançado</h1>
        <p className="text-gray-600">Análise detalhada de clientes e performance</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-semibold mb-2 text-gray-600">Clientes Ativos</h3>
          <p className="text-3xl font-bold text-green-600">{dashboard?.activeClients || 0}</p>
          <p className="text-xs text-gray-500 mt-1">de {dashboard?.totalClients || 0} total</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-semibold mb-2 text-gray-600">Taxa de Retenção</h3>
          <p className="text-3xl font-bold text-blue-600">
            {retention?.retentionRate.toFixed(1) || 0}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-semibold mb-2 text-gray-600">Em Risco</h3>
          <p className="text-3xl font-bold text-red-600">{dashboard?.atRiskClients || 0}</p>
          <p className="text-xs text-gray-500 mt-1">churn risk alto</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-semibold mb-2 text-gray-600">CLV Médio</h3>
          <p className="text-3xl font-bold text-purple-600">
            R$ {dashboard?.avgClientLTV?.toFixed(2) || '0,00'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Retention Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Status de Retenção</h2>
          </div>
          <div className="p-6">
            {retention?.byStatus && retention.byStatus.length > 0 ? (
              <div className="space-y-3">
                {retention.byStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${
                        item.status === 'ACTIVE' ? 'bg-green-500' :
                        item.status === 'NEW' ? 'bg-blue-500' :
                        item.status === 'AT_RISK' ? 'bg-yellow-500' :
                        item.status === 'DORMANT' ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}></span>
                      <span className="font-medium capitalize">{item.status}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{item.count}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Sem dados</p>
            )}
          </div>
        </div>

        {/* At Risk Clients */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Clientes em Risco</h2>
          </div>
          <div className="p-6">
            {atRisk && atRisk.length > 0 ? (
              <div className="space-y-3">
                {atRisk.map((item) => (
                  <div key={item.clientId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{item.client?.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.daysSinceLastVisit} dias sem visita
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{item.churnRisk.toFixed(0)}%</p>
                      <p className="text-xs text-gray-500">risco</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum cliente em risco</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Clients */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Melhores Clientes</h2>
        </div>
        <div className="p-6">
          {topClients && topClients.length > 0 ? (
            <div className="space-y-3">
              {topClients.map((item, index) => (
                <div key={item.clientId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-2xl text-gray-400 w-8">{index + 1}</span>
                    <div>
                      <p className="font-semibold">{item.client?.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.totalVisits} visitas | CLV: R$ {item.predictedLTV?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">R$ {item.lifetimeValue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">receita total</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Sem dados</p>
          )}
        </div>
      </div>
    </div>
  );
}
