
import React from 'react';
import { useQuery } from 'wasp/client/operations';
import { listReferralPrograms, getReferralStats, getReferralLeaderboard } from 'wasp/client/operations';

export default function ReferralProgramPage() {
  const salonId = 'current-salon-id'; // Would come from context
  
  const { data: programs, isLoading: loadingPrograms } = useQuery(listReferralPrograms, { salonId });
  const { data: stats, isLoading: loadingStats } = useQuery(getReferralStats, { salonId });
  const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery(getReferralLeaderboard, { salonId, limit: 5 });

  if (loadingPrograms) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Programa de Indicações</h1>
        <p className="text-gray-600">Gerencie indicações e recompensas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-semibold mb-2 text-gray-600">Total de Indicações</h3>
          <p className="text-3xl font-bold text-primary-600">{stats?.totalReferrals || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-semibold mb-2 text-gray-600">Qualificadas</h3>
          <p className="text-3xl font-bold text-green-600">{stats?.qualifiedReferrals || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-semibold mb-2 text-gray-600">Taxa de Conversão</h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats?.conversionRate.toFixed(1) || 0}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-semibold mb-2 text-gray-600">Recompensas Emitidas</h3>
          <p className="text-3xl font-bold text-purple-600">
            R$ {stats?.totalRewardsIssued.toFixed(2) || '0,00'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Programas de Indicação</h2>
          </div>
          <div className="p-6">
            {programs && programs.length > 0 ? (
              <div className="space-y-4">
                {programs.map((program) => (
                  <div key={program.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{program.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Indicador: {program.referrerRewardType} - R$ {program.referrerRewardValue}
                        </p>
                        <p className="text-sm text-gray-600">
                          Indicado: {program.refereeRewardType} - R$ {program.refereeRewardValue}
                        </p>
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

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Top Indicadores</h2>
          </div>
          <div className="p-6">
            {leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((item, index) => (
                  <div key={item.client?.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-2xl text-gray-400 w-8">{index + 1}</span>
                      <div>
                        <p className="font-semibold">{item.client?.name}</p>
                        <p className="text-sm text-gray-600">{item.referralCount} indicações</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">R$ {item.totalRewards.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">em recompensas</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhuma indicação ainda</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
