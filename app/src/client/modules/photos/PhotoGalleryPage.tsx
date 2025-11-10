
import React, { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getPhotoGallery } from 'wasp/client/operations';

export default function PhotoGalleryPage() {
  const [filter, setFilter] = useState<'all' | 'beforeAfter' | 'portfolio'>('all');
  
  const { data, isLoading } = useQuery(getPhotoGallery, {
    salonId: 'current-salon-id', // Would come from context
    beforeAfterOnly: filter === 'beforeAfter',
    publicOnly: filter === 'portfolio',
    page: 1,
    perPage: 30
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Galeria de Fotos</h1>
        <p className="text-gray-600">Gerencie fotos de clientes e resultados</p>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('beforeAfter')}
          className={`px-4 py-2 rounded-lg ${filter === 'beforeAfter' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
        >
          Antes/Depois
        </button>
        <button
          onClick={() => setFilter('portfolio')}
          className={`px-4 py-2 rounded-lg ${filter === 'portfolio' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
        >
          Portfólio
        </button>
      </div>

      {/* Before/After Pairs */}
      {data?.beforeAfterPairs && data.beforeAfterPairs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Antes e Depois</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.beforeAfterPairs.map((pair: any) => (
              <div key={pair.pairId} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="grid grid-cols-2">
                  <div className="relative">
                    <img 
                      src={pair.before?.fileUrl} 
                      alt="Before"
                      className="w-full h-48 object-cover"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded">
                      Antes
                    </span>
                  </div>
                  <div className="relative">
                    <img 
                      src={pair.after?.fileUrl} 
                      alt="After"
                      className="w-full h-48 object-cover"
                    />
                    <span className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded">
                      Depois
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-semibold">{pair.before?.client?.name}</p>
                  <p className="text-sm text-gray-600">{pair.before?.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Single Photos */}
      {data?.singlePhotos && data.singlePhotos.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Todas as Fotos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {data.singlePhotos.map((photo: any) => (
              <div key={photo.id} className="bg-white rounded-lg shadow overflow-hidden">
                <img 
                  src={photo.thumbnailUrl || photo.fileUrl} 
                  alt={photo.title || 'Photo'}
                  className="w-full h-40 object-cover"
                />
                <div className="p-2">
                  <p className="text-xs font-semibold truncate">{photo.client?.name}</p>
                  {photo.tags && photo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {photo.tags.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="text-xs bg-gray-100 px-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!data?.beforeAfterPairs?.length && !data?.singlePhotos?.length) && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma foto encontrada</p>
        </div>
      )}
    </div>
  );
}
