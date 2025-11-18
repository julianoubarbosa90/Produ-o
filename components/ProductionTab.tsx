import React, { useState, useEffect, useCallback } from 'react';
import type { ProductionItem } from '../types';
import { firebaseService } from '../services/firebaseService';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div>
      <p className="text-sm text-neutral-400">{label}</p>
      <p className="font-medium text-white">{value}</p>
    </div>
  );
};

const borderColorMap: Record<string, string> = {
  'Verde': 'border-l-green-500',
  'Branco': 'border-l-gray-300',
  'Azul': 'border-l-blue-500',
  'Verde folha': 'border-l-lime-500',
};

const textColorMap: Record<string, string> = {
  'Verde': 'text-green-400',
  'Branco': 'text-white',
  'Azul': 'text-blue-400',
  'Verde folha': 'text-lime-400',
};


const ProductionItemCard: React.FC<{ item: ProductionItem; onDelete: (id: string) => void; }> = ({ item, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasCleats = item.cleatHeight || item.cleatProfile || (item.cleatQuantity && item.cleatQuantity !== '0');
  const borderColorClass = borderColorMap[item.color] || 'border-l-neutral-500';
  const textColorClass = textColorMap[item.color] || 'text-rose-400';

  return (
    <div className={`bg-neutral-800 rounded-lg border border-neutral-700 border-l-4 ${borderColorClass} transition-shadow hover:shadow-xl`}>
      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="mb-4 sm:mb-0">
          <h3 className={`text-lg font-bold ${textColorClass}`}>
            {item.name || 'Peça sem nome'} (OS: {item.os})
          </h3>
          <p className="text-neutral-400 -mt-1">{item.length || 'N/A'}mm x {item.width || 'N/A'}mm</p>
          <p className="text-xs text-neutral-500 mt-2">
            Criado em: {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold bg-neutral-700 px-3 py-1 rounded-full">{item.material} - {item.color}</span>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-neutral-300 hover:text-white px-2 py-1"
            >
                {isExpanded ? 'Ver Menos' : 'Ver Detalhes'}
            </button>
             <button
              onClick={() => onDelete(item.id)}
              className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-neutral-700 transition-colors"
              aria-label="Excluir Peça"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
        </div>
      </div>
      {isExpanded && (
        <div className="border-t border-neutral-700 p-4 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <DetailItem label="Comprimento" value={item.length ? `${item.length} mm` : ''} />
            <DetailItem label="Largura" value={item.width ? `${item.width} mm` : ''} />
            <DetailItem label="Cor" value={item.color} />
            <DetailItem label="Material" value={item.material} />
            <DetailItem label="Espessura" value={item.thickness ? `${item.thickness} mm` : ''} />
            <DetailItem label="Textura" value={item.texture} />
            <DetailItem label="Emenda" value={item.spliceType} />
          </div>
          {item.observation && (
            <div className="mt-4 pt-4 border-t border-neutral-700">
                <h4 className="font-semibold text-white mb-2">Observação</h4>
                <p className="text-neutral-300 whitespace-pre-wrap bg-neutral-900 p-3 rounded-md">{item.observation}</p>
            </div>
          )}
          {hasCleats && (
            <div className="mt-4 pt-4 border-t border-neutral-700">
                <h4 className="font-semibold text-white mb-2">Detalhes da Talisca</h4>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <DetailItem label="Altura" value={item.cleatHeight} />
                    <DetailItem label="Talisca/Guia" value={item.cleatProfile} />
                    <DetailItem label="Quantidade" value={item.cleatQuantity} />
                    <DetailItem label="Passo" value={item.cleatPitch} />
                    <DetailItem label="Largura" value={item.cleatWidth} />
                    <DetailItem label="Formato" value={item.cleatFormat} />
                 </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-neutral-900 rounded-lg shadow-2xl border border-neutral-800 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-white">Confirmar Exclusão</h2>
          <p className="text-neutral-400 mt-2">Tem certeza que deseja excluir esta peça? A ação não pode ser desfeita.</p>
        </div>
        <div className="p-4 bg-neutral-950 rounded-b-lg flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 transition-colors" disabled={isDeleting}>
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-500 transition-colors flex items-center justify-center w-32" disabled={isDeleting}>
            {isDeleting ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductionTab: React.FC = () => {
  const [items, setItems] = useState<ProductionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      const productionItems = await firebaseService.getProductionItems();
      productionItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setItems(productionItems);
      setIsLoading(false);
    };
    fetchItems();
  }, []);

  const handleRequestDelete = (id: string) => {
    setItemToDelete(id);
  };

  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await firebaseService.deleteProductionItem(itemToDelete);
      setItems(prevItems => prevItems.filter(item => item.id !== itemToDelete));
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert('Ocorreu um erro ao excluir a peça.');
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  }, [itemToDelete]);
  
  const handleCancelDelete = () => {
    setItemToDelete(null);
  };

  const filteredItems = items.filter(item =>
    (item.os || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Peças Salvas</h1>
      
      <div className="bg-neutral-900 p-4 rounded-lg shadow-lg border border-neutral-800">
        <label htmlFor="os-search" className="sr-only">Buscar por Nome ou OS</label>
        <input
          id="os-search"
          type="text"
          placeholder="Buscar por Nome ou Ordem de Serviço (OS)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-md py-2 px-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-600"
        />
      </div>

      <div className="bg-neutral-900 p-6 rounded-lg shadow-lg border border-neutral-800">
        <h2 className="text-xl font-semibold mb-4 text-white">Histórico de Peças</h2>
        {isLoading ? <p className="text-neutral-400">Carregando...</p> : (
          <div className="space-y-4">
            {filteredItems.length === 0 ? 
              <p className="text-neutral-400 text-center py-4">
                {searchQuery ? 'Nenhuma peça encontrada com essa busca.' : 'Nenhuma peça foi salva ainda. Vá para a aba "Início" para criar uma.'}
              </p> 
              :
              filteredItems.map(item => (
                <ProductionItemCard key={item.id} item={item} onDelete={handleRequestDelete} />
              ))
            }
          </div>
        )}
      </div>
       <DeleteConfirmationModal 
        isOpen={!!itemToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ProductionTab;