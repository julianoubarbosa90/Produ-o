import React, { useState, useEffect, useCallback } from 'react';
import type { InventoryItem, Formula } from '../types';
import { firebaseService } from '../services/firebaseService';
import { formulaService, FormulaResult } from '../services/formulaService';

const productionVariables = [
    { name: 'nome', description: 'Nome da peça (texto)' },
    { name: 'os', description: 'Nº da Ordem de Serviço (texto)' },
    { name: 'comprimento', description: 'Comprimento da peça em mm (número)' },
    { name: 'largura', description: 'Largura da peça em mm (número)' },
    { name: 'cor', description: 'Cor da peça (texto)' },
    { name: 'material', description: 'Material da peça (texto)' },
    { name: 'textura', description: 'Textura da peça (texto)' },
    { name: 'espessura', description: 'Espessura da peça em mm (número)' },
    { name: 'emenda', description: 'Tipo de emenda (texto)' },
    { name: 'talisca_altura', description: 'Altura da talisca (número)' },
    { name: 'talisca_guia', description: 'Perfil da talisca/guia (texto)' },
    { name: 'talisca_quantidade', description: 'Quantidade de taliscas (número)' },
    { name: 'talisca_passo', description: 'Passo entre taliscas (número)' },
    { name: 'talisca_largura', description: 'Largura da talisca (número)' },
    { name: 'talisca_formato', description: 'Formato da talisca (texto)' },
    { name: 'observacao', description: 'Notas sobre a peça (texto)' },
];

const VariablesQuickView: React.FC<{ inventory: InventoryItem[] }> = ({ inventory }) => (
    <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700 max-h-60 overflow-y-auto">
        <h4 className="text-md font-semibold text-white mb-3">Variáveis Rápidas</h4>
        <div className="space-y-3 text-sm">
            <div>
                <p className="text-neutral-400 font-bold mb-1">Peça:</p>
                <ul className="space-y-1 pl-2">
                {productionVariables.map(v => (
                    <li key={v.name} className="font-mono text-rose-400">{v.name}</li>
                ))}
                </ul>
            </div>
            <div>
                <p className="text-neutral-400 font-bold mb-1">Estoque:</p>
                {inventory.length > 0 ? (
                    <ul className="space-y-1 pl-2">
                    {inventory.map(item => (
                        <li key={item.id} className="font-mono text-rose-400">{item.variableName}</li>
                    ))}
                    </ul>
                ) : <p className="text-xs text-neutral-500 pl-2">Nenhum item no estoque</p>}
            </div>
        </div>
    </div>
);


const FormulaModal: React.FC<{
  formula?: Formula | null;
  onSave: (formulaData: Omit<Formula, 'id' | 'orderIndex'>) => void;
  onClose: () => void;
  inventory: InventoryItem[];
}> = ({ formula, onSave, onClose, inventory }) => {
  const [name, setName] = useState(formula?.name || '');
  const [condition, setCondition] = useState(formula?.condition || '');
  const [action, setAction] = useState(formula?.action || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !condition.trim() || !action.trim()) {
      alert('Todos os campos são obrigatórios.');
      return;
    }
    onSave({ name, condition, action });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-neutral-900 rounded-lg shadow-2xl border border-neutral-800 w-full max-w-4xl mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-2xl font-bold text-white">{formula ? 'Editar Fórmula' : 'Nova Fórmula'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label htmlFor="formula-name" className="block text-sm font-medium text-neutral-300 mb-1">Nome / Descrição</label>
                <input id="formula-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Custo total de parafusos" className="w-full bg-neutral-800 border border-neutral-700 rounded-md py-2 px-3 text-white" />
              </div>
              <div>
                <label htmlFor="formula-condition" className="block text-sm font-medium text-neutral-300 mb-1">Condição de Ativação (SE)</label>
                <input id="formula-condition" type="text" value={condition} onChange={e => setCondition(e.target.value)} placeholder="Ex: parafusos > 100 AND material == 'Pvc'" className="w-full bg-neutral-800 border border-neutral-700 rounded-md py-2 px-3 text-white font-mono" />
              </div>
              <div>
                <label htmlFor="formula-action" className="block text-sm font-medium text-neutral-300 mb-1">Ação / Resultado (ENTÃO)</label>
                <input id="formula-action" type="text" value={action} onChange={e => setAction(e.target.value)} placeholder='Ex: custo_parafusos = parafusos * 0.5' className="w-full bg-neutral-800 border border-neutral-700 rounded-md py-2 px-3 text-white font-mono" />
                <p className="text-xs text-neutral-500 mt-1">Para textos, use aspas: `aviso = "Verificar estoque"`</p>
              </div>
            </div>
            <div className="md:col-span-1">
                <VariablesQuickView inventory={inventory} />
            </div>
          </div>
          <div className="p-4 bg-neutral-950 rounded-b-lg text-right space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-600">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-rose-800 text-white rounded-md hover:bg-rose-700">Salvar</button>
          </div>
        </form>
      </div>
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
          <p className="text-neutral-400 mt-2">Tem certeza que deseja excluir esta fórmula? A ação não pode ser desfeita.</p>
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

const FormulasTab: React.FC = () => {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [results, setResults] = useState<Record<string, FormulaResult>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [formulaToDelete, setFormulaToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [inventoryItems, formulaItems] = await Promise.all([
      firebaseService.getInventory(),
      firebaseService.getFormulas(),
    ]);
    formulaItems.sort((a, b) => a.orderIndex - b.orderIndex);
    setInventory(inventoryItems);
    setFormulas(formulaItems);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCalculate = () => {
    const inventoryContext = inventory.reduce((acc, item) => {
      acc[item.variableName] = item.total;
      return acc;
    }, {} as Record<string, number>);
    const evaluationResult = formulaService.evaluateFormulaList(formulas, inventoryContext);
    setResults(evaluationResult);
  };

  const handleSaveFormula = async (formulaData: Omit<Formula, 'id' | 'orderIndex'>) => {
    if (editingFormula) {
      await firebaseService.updateFormula(editingFormula.id, formulaData);
    } else {
      const maxOrderIndex = formulas.reduce((max, f) => Math.max(max, f.orderIndex), -1);
      await firebaseService.addFormula({ ...formulaData, orderIndex: maxOrderIndex + 1 });
    }
    setEditingFormula(null);
    setIsModalOpen(false);
    fetchData();
  };
  
  const handleRequestDelete = (id: string) => {
    setFormulaToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!formulaToDelete) return;
    setIsDeleting(true);
    try {
      await firebaseService.deleteFormula(formulaToDelete);
      setFormulas(prev => prev.filter(f => f.id !== formulaToDelete));
    } catch (error) {
      console.error("Failed to delete formula:", error);
      alert('Ocorreu um erro ao excluir a fórmula.');
      fetchData();
    } finally {
      setIsDeleting(false);
      setFormulaToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setFormulaToDelete(null);
  };

  const handleReorder = async (dragIndex: number, dropIndex: number) => {
    if (dragIndex === dropIndex) return;
    const reordered = [...formulas];
    const [draggedItem] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, draggedItem);
    setFormulas(reordered);

    const updates = reordered.map((f, index) => ({ id: f.id, orderIndex: index }));
    await firebaseService.updateFormulaOrder(updates);
  };

  const ResultDisplay: React.FC<{ result?: FormulaResult }> = ({ result }) => {
    if (!result) return <p className="text-xs text-neutral-500">Aguardando cálculo...</p>;
    if (result.error) return <p className="text-xs text-red-400 font-mono">Erro: {result.error}</p>;
    if (!result.isActive) return <p className="text-xs text-neutral-400">Condição não atendida.</p>;
    
    const value = result.output?.value;
    const displayValue = typeof value === 'number' ? value.toFixed(2) : `"${value}"`;
    
    return <p className="text-sm font-mono text-green-300">{result.output?.variableName} = {displayValue}</p>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Motor de Fórmulas</h1>
      
      <div className="flex space-x-4">
         <button onClick={() => { setEditingFormula(null); setIsModalOpen(true); }} className="px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 transition-colors">
            Adicionar Nova Fórmula
          </button>
          <button onClick={handleCalculate} className="px-6 py-2 bg-rose-800 text-white font-semibold rounded-md hover:bg-rose-700 transition-colors">
            Calcular com base no Estoque
          </button>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-neutral-900 p-6 rounded-lg shadow-lg border border-neutral-800 self-start">
           <h2 className="text-xl font-semibold text-white mb-4">Variáveis Disponíveis</h2>
            <div className="max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-rose-300 mb-2">Variáveis da Peça</h3>
               <ul className="space-y-2 mb-6">
                {productionVariables.map(v => (
                     <li key={v.name} className="bg-neutral-800 p-2 rounded">
                        <p className="font-mono text-rose-400">{v.name}</p>
                        <p className="text-xs text-neutral-400">{v.description}</p>
                    </li>
                ))}
               </ul>
              <h3 className="text-lg font-semibold text-rose-300 mb-2">Variáveis de Estoque</h3>
              {inventory.length > 0 ? (
                <ul className="space-y-2">
                  {inventory.map(item => (
                    <li key={item.id} className="flex justify-between items-center bg-neutral-800 p-2 rounded">
                      <div className="flex items-center">
                        <div className="w-2 h-4 rounded-full mr-3" style={{backgroundColor: item.color}}></div>
                        <span className="font-mono text-rose-400">{item.variableName}</span>
                      </div>
                      <span className="font-semibold text-white">{item.total}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-neutral-400">Nenhuma variável de estoque.</p>
              )}
            </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <p className="text-center text-neutral-400">Carregando fórmulas...</p>
          ) : formulas.length === 0 ? (
            <div className="text-center py-10 bg-neutral-900 rounded-lg border-2 border-dashed border-neutral-800">
                <p className="text-neutral-400">Nenhuma fórmula criada.</p>
                <p className="text-sm text-neutral-500">Clique em "Adicionar Nova Fórmula" para começar.</p>
            </div>
          ) : (
            formulas.map((formula, index) => (
              <div
                key={formula.id}
                draggable
                onDragStart={() => setDraggedIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (draggedIndex !== null) handleReorder(draggedIndex, index); setDraggedIndex(null); }}
                onDragEnd={() => setDraggedIndex(null)}
                className={`bg-neutral-900 p-4 rounded-lg shadow-lg border border-neutral-800 transition-opacity ${draggedIndex === index ? 'opacity-30' : ''}`}
              >
                <div className="flex items-start">
                    <div className="cursor-move text-neutral-500 hover:text-white mr-3 pt-1" title="Arraste para reordenar">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-white mb-2">{formula.name}</h3>
                            <div className="flex space-x-3">
                                <button onClick={() => { setEditingFormula(formula); setIsModalOpen(true); }} className="text-blue-400 hover:text-blue-300 text-sm">Editar</button>
                                <button onClick={() => handleRequestDelete(formula.id)} className="text-red-500 hover:text-red-400 text-sm">Excluir</button>
                            </div>
                        </div>
                        <div className="font-mono text-sm space-x-2 bg-neutral-800 p-3 rounded-md">
                            <span className="text-cyan-400">SE</span>
                            <span className="text-neutral-300">({formula.condition})</span>
                            <span className="text-cyan-400">ENTÃO</span>
                            <span className="text-neutral-300">{formula.action}</span>
                        </div>
                        <div className={`mt-3 pt-3 border-t border-neutral-800 ${results[formula.id]?.isActive ? 'bg-green-900 bg-opacity-20' : 'bg-neutral-800 bg-opacity-20'} p-2 rounded`}>
                             <ResultDisplay result={results[formula.id]} />
                        </div>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && <FormulaModal formula={editingFormula} onSave={handleSaveFormula} onClose={() => setIsModalOpen(false)} inventory={inventory} />}
      <DeleteConfirmationModal
        isOpen={!!formulaToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default FormulasTab;