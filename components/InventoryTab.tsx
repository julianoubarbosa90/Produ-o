import React, { useState, useEffect, useCallback } from 'react';
import type { InventoryItem, InventoryHistoryLog } from '../types';
import { firebaseService } from '../services/firebaseService';
import { INVENTORY_COLORS } from '../constants';

const InventoryHistoryModal: React.FC<{ item: InventoryItem; onClose: () => void; }> = ({ item, onClose }) => {
  const [history, setHistory] = useState<InventoryHistoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const historyLogs = await firebaseService.getInventoryHistory(item.id);
      setHistory(historyLogs);
      setIsLoading(false);
    };
    fetchHistory();
  }, [item.id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-neutral-900 rounded-lg shadow-2xl border border-neutral-800 w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Histórico de Ajustes: {item.displayName}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-2xl font-bold">&times;</button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <p className="text-neutral-400 text-center">Carregando histórico...</p>
          ) : history.length === 0 ? (
            <p className="text-neutral-400 text-center">Nenhum histórico de ajuste rápido encontrado.</p>
          ) : (
            <ul className="space-y-3">
              {history.map(log => (
                <li key={log.id} className="bg-neutral-800 p-4 rounded-md flex justify-between items-center">
                  <div>
                    <p className={`text-lg font-semibold ${log.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      Ajuste: {log.change > 0 ? `+${log.change}` : log.change}
                    </p>
                    <p className="text-sm text-neutral-400">Novo Total: {log.newValue}</p>
                  </div>
                  <p className="text-xs text-neutral-500">{new Date(log.timestamp).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-4 bg-neutral-950 rounded-b-lg text-right">
           <button onClick={onClose} className="px-4 py-2 bg-rose-800 text-white rounded-md hover:bg-rose-700">Fechar</button>
        </div>
      </div>
    </div>
  );
};

const InventoryItemRow: React.FC<{
  item: InventoryItem;
  isDragged: boolean;
  onUpdate: (id: string, updates: Partial<InventoryItem>) => void;
  onDelete: (id: string) => void;
  onQuickAdjust: (item: InventoryItem, amount: number) => void;
  onViewHistory: (item: InventoryItem) => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}> = ({ item, isDragged, onUpdate, onDelete, onQuickAdjust, onViewHistory, onDragStart, onDragOver, onDrop, onDragEnd }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(item);
  const missing = item.idealTotal - item.total;
  
  const handleSave = () => {
    onUpdate(item.id, editData);
    setIsEditing(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: name.includes('Total') ? parseInt(value) || 0 : value }));
  };

  const rowClasses = `border-b border-neutral-800 last:border-b-0 transition-opacity ${isDragged ? 'opacity-30' : ''} ${isEditing ? 'bg-neutral-800' : 'hover:bg-neutral-800'}`;

  if (isEditing) {
    return (
      <tr className={rowClasses}>
        <td></td>
        <td><div className="w-2 h-full" style={{ backgroundColor: editData.color }}></div></td>
        <td className="p-3"><input type="text" name="displayName" value={editData.displayName} onChange={handleInputChange} className="bg-neutral-700 w-full p-1 rounded" /></td>
        <td className="p-3"><input type="text" name="variableName" value={editData.variableName} onChange={handleInputChange} className="bg-neutral-700 w-full p-1 rounded" /></td>
        <td className="p-3"><input type="text" name="unit" value={editData.unit} onChange={handleInputChange} className="bg-neutral-700 w-16 p-1 rounded" /></td>
        <td className="p-3"><input type="number" name="total" value={editData.total} onChange={handleInputChange} className="bg-neutral-700 w-20 p-1 rounded" /></td>
        <td className="p-3"><input type="number" name="idealTotal" value={editData.idealTotal} onChange={handleInputChange} className="bg-neutral-700 w-20 p-1 rounded" /></td>
        <td className="p-3"></td>
        <td className="p-3"></td>
        <td className="p-3">
          <div className="flex space-x-2">
            <button onClick={handleSave} className="text-green-400 hover:text-green-300">Salvar</button>
            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-300">Cancelar</button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr
      draggable={!isEditing}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={rowClasses}
    >
      <td className="p-3 cursor-move text-neutral-500 hover:text-white" title="Arraste para reordenar">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </td>
      <td><div className="w-2 h-16" style={{ backgroundColor: item.color }}></div></td>
      <td className="p-3 font-medium">{item.displayName}</td>
      <td className="p-3 text-gray-400 font-mono">{item.variableName}</td>
      <td className="p-3 text-gray-400">{item.unit}</td>
      <td className="p-3 text-2xl font-semibold">{item.total}</td>
      <td className="p-3 text-gray-400">{item.idealTotal}</td>
      <td className={`p-3 font-bold ${missing > 0 ? 'text-red-500' : 'text-green-500'}`}>
        {missing > 0 ? `-${missing}` : `+${Math.abs(missing)}`}
      </td>
      <td className="p-3">
        <div className="flex space-x-1">
          {[-10, -1, 1, 10].map(amount => (
            <button key={amount} onClick={() => onQuickAdjust(item, amount)} className="bg-neutral-700 w-8 h-8 rounded hover:bg-rose-700 transition-colors">
              {amount > 0 ? `+${amount}` : amount}
            </button>
          ))}
        </div>
      </td>
      <td className="p-3">
        <div className="flex space-x-2">
          <button onClick={() => setIsEditing(true)} className="text-blue-400 hover:text-blue-300">Editar</button>
          <button onClick={() => onViewHistory(item)} className="text-purple-400 hover:text-purple-300">Histórico</button>
          <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-400">Excluir</button>
        </div>
      </td>
    </tr>
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
          <p className="text-neutral-400 mt-2">Tem certeza que deseja excluir este item do estoque? A ação não pode ser desfeita.</p>
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

const InventoryTab: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newItem, setNewItem] = useState({ displayName: '', variableName: '', total: 0, idealTotal: 100, color: INVENTORY_COLORS[0], unit: 'un' });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingHistoryOf, setViewingHistoryOf] = useState<InventoryItem | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    let items = await firebaseService.getInventory();
    
    const needsMigration = items.some(item => typeof item.orderIndex !== 'number');
    if (needsMigration) {
        const updates = items.map((item, index) => ({ id: item.id, orderIndex: index }));
        await firebaseService.updateInventoryOrder(updates);
        items = items.map((item, index) => ({ ...item, orderIndex: index }));
    }
    
    items.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    
    setInventory(items);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleUpdate = async (id: string, updates: Partial<InventoryItem>) => {
    await firebaseService.updateInventoryItem(id, updates);
    fetchInventory();
  };
  
  const handleRequestDelete = (id: string) => {
    setItemToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await firebaseService.deleteInventoryItem(itemToDelete);
      setInventory(prev => prev.filter(item => item.id !== itemToDelete));
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert('Ocorreu um erro ao excluir o item.');
      fetchInventory(); 
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setItemToDelete(null);
  };

  const handleQuickAdjust = async (item: InventoryItem, amount: number) => {
    const newTotal = Math.max(0, item.total + amount);
    await firebaseService.updateInventoryItem(item.id, { total: newTotal });
    await firebaseService.logInventoryAdjustment({
      itemId: item.id,
      itemDisplayName: item.displayName,
      change: amount,
      newValue: newTotal,
      timestamp: new Date().toISOString(),
    });
    fetchInventory();
  };
  
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.displayName.trim() || !newItem.variableName.trim() || !newItem.unit.trim()) {
        alert("Nome de exibição, nome da variável e unidade são obrigatórios.");
        return;
    }
    const maxOrderIndex = inventory.reduce((max, item) => Math.max(max, item.orderIndex ?? -1), -1);
    const newItemWithOrder = { ...newItem, orderIndex: maxOrderIndex + 1 };

    await firebaseService.addInventoryItem(newItemWithOrder);
    setNewItem({ displayName: '', variableName: '', total: 0, idealTotal: 100, color: INVENTORY_COLORS[0], unit: 'un' });
    fetchInventory();
  };

  const handleReorder = async (dragIndex: number, dropIndex: number) => {
    if (dragIndex === dropIndex) return;
    const reorderedInventory = [...inventory];
    const [draggedItem] = reorderedInventory.splice(dragIndex, 1);
    reorderedInventory.splice(dropIndex, 0, draggedItem);
    
    setInventory(reorderedInventory);

    const updates = reorderedInventory.map((item, index) => ({ id: item.id, orderIndex: index }));
    await firebaseService.updateInventoryOrder(updates);
  };

  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: name.includes('Total') ? parseInt(value) || 0 : value }));
  };
  
  const filteredInventory = inventory.filter(item =>
    (item.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.variableName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Gerenciamento de Estoque</h1>
      
      <div className="bg-neutral-900 p-6 rounded-lg shadow-lg border border-neutral-800">
        <h2 className="text-xl font-semibold mb-4 text-white">Adicionar Novo Item</h2>
        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome de Exibição</label>
            <input type="text" name="displayName" value={newItem.displayName} onChange={handleNewItemChange} className="w-full bg-neutral-800 p-2 rounded border border-neutral-700" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome da Variável</label>
            <input type="text" name="variableName" value={newItem.variableName} onChange={handleNewItemChange} className="w-full bg-neutral-800 p-2 rounded border border-neutral-700" required />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Unidade</label>
            <input type="text" name="unit" value={newItem.unit} onChange={handleNewItemChange} placeholder="un, kg, m" className="w-full bg-neutral-800 p-2 rounded border border-neutral-700" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Cor</label>
            <div className="flex space-x-2 p-2 bg-neutral-800 rounded border border-neutral-700">
              {INVENTORY_COLORS.map(color => (
                <button type="button" key={color} onClick={() => setNewItem(prev => ({ ...prev, color }))} className={`w-6 h-6 rounded-full ${newItem.color === color ? 'ring-2 ring-offset-2 ring-offset-neutral-800 ring-white' : ''}`} style={{ backgroundColor: color }}></button>
              ))}
            </div>
          </div>
          <button type="submit" className="px-4 py-2 bg-rose-800 text-white rounded-md hover:bg-rose-700 h-10">Adicionar</button>
        </form>
      </div>
      
      <div className="bg-neutral-900 p-4 rounded-lg shadow-lg border border-neutral-800">
        <label htmlFor="inventory-search" className="sr-only">Buscar itens do estoque</label>
        <input
          id="inventory-search"
          type="text"
          placeholder="Buscar por nome de exibição ou variável..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-md py-2 px-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-600"
        />
      </div>

      <div className="bg-neutral-900 rounded-lg shadow-lg border border-neutral-800 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-neutral-800 text-sm uppercase text-neutral-400">
            <tr>
              <th className="p-3 w-12"></th>
              <th className="w-2"></th>
              <th className="p-3">Item</th>
              <th className="p-3">Variável</th>
              <th className="p-3">Unidade</th>
              <th className="p-3">Total</th>
              <th className="p-3">Ideal</th>
              <th className="p-3">Falta</th>
              <th className="p-3">Ajuste Rápido</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={10} className="text-center p-4 text-neutral-400">Carregando estoque...</td></tr>
            ) : inventory.length === 0 ? (
                <tr><td colSpan={10} className="text-center p-4 text-neutral-400">Nenhum item no estoque.</td></tr>
            ) : filteredInventory.length > 0 ? (
                filteredInventory.map((item, index) => (
                    <InventoryItemRow 
                      key={item.id} 
                      item={item} 
                      isDragged={draggedIndex === index}
                      onUpdate={handleUpdate} 
                      onDelete={handleRequestDelete}
                      onQuickAdjust={handleQuickAdjust}
                      onViewHistory={setViewingHistoryOf}
                      onDragStart={() => setDraggedIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedIndex === null) return;
                        handleReorder(draggedIndex, index);
                        setDraggedIndex(null);
                      }}
                      onDragEnd={() => setDraggedIndex(null)}
                    />
                ))
            ) : (
                <tr><td colSpan={10} className="text-center p-4 text-neutral-400">Nenhum item corresponde à sua busca.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {viewingHistoryOf && (
        <InventoryHistoryModal item={viewingHistoryOf} onClose={() => setViewingHistoryOf(null)} />
      )}
      <DeleteConfirmationModal 
        isOpen={!!itemToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default InventoryTab;