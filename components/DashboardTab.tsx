import React, { useState, useMemo, useEffect } from 'react';
import { firebaseService } from '../services/firebaseService';
import type { ProductionItem, InventoryItem, Formula } from '../types';
import { formulaService, FormulaResult } from '../services/formulaService';

type ProductionConfig = Omit<ProductionItem, 'id' | 'createdAt'>;

const colorOptions = ['Verde', 'Branco', 'Azul', 'Verde folha'] as const;
const materialOptions = ['Pvc', 'Pu'] as const;
const textureOptions = ['Brilhante', 'Fosco', 'Corrugado', 'Frizado', 'Cruz de Malta', 'Piramide invertida', 'Dentada', 'rabo de andorinha'] as const;
const thicknessOptions = {
    Pvc: ['2.0', '2.8', '4', '1'],
    Pu: ['0.9', '1.3'],
};
const spliceTypeOptions = ['Vulcanizada', 'GramPo', 'Aberta'] as const;

const cleatHeightOptions = ['80', '70', '60', '50', '40', '30', '20'] as const;
const cleatProfileOptions = ['13x8', '10x6', '8x5', '6x4', '17x11', '10x10', '12x12'] as const;
const cleatFormatOptions = ['Reta', 'Inclinada', 'TPc', 'Recartilhada', 'Rabo de Jacaré'] as const;

const initialCleatState: Pick<ProductionConfig, 'cleatHeight' | 'cleatProfile' | 'cleatQuantity' | 'cleatPitch' | 'cleatWidth' | 'cleatFormat'> = {
    cleatHeight: '',
    cleatProfile: '',
    cleatQuantity: '0',
    cleatPitch: '0',
    cleatWidth: '0',
    cleatFormat: '',
};

const initialState: ProductionConfig = {
    name: '',
    os: '',
    length: '',
    width: '',
    color: colorOptions[0],
    material: materialOptions[0],
    texture: textureOptions[0],
    thickness: thicknessOptions[materialOptions[0]][0],
    spliceType: spliceTypeOptions[0],
    observation: '',
    ...initialCleatState
};

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-neutral-900 p-6 rounded-lg shadow-lg border border-neutral-800">
        <h2 className="text-xl font-semibold mb-6 text-white border-b border-neutral-800 pb-3">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children}
        </div>
    </div>
);

const FormField: React.FC<{ label: string; children: React.ReactNode, className?: string }> = ({ label, children, className }) => (
    <div className={className}>
        <label className="block text-sm font-medium text-neutral-300 mb-2">{label}</label>
        {children}
    </div>
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input
        {...props}
        className="w-full bg-neutral-800 border border-neutral-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-600 transition-colors"
    />
);

const SelectInput: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[] | string[] }> = ({ options, ...props }) => (
    <select
        {...props}
        className="w-full bg-neutral-800 border border-neutral-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-600 transition-colors"
    >
        <option value="">Selecione...</option>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
    </select>
);

const Accordion: React.FC<{ title: string, isOpen: boolean, onToggle: () => void, children: React.ReactNode }> = ({ title, isOpen, onToggle, children }) => (
    <div className="bg-neutral-900 rounded-lg shadow-lg border border-neutral-800">
        <button
            type="button"
            onClick={onToggle}
            className="w-full flex justify-between items-center p-6 text-left"
            aria-expanded={isOpen}
        >
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
            <div className="p-6 pt-0">
                <div className="border-t border-neutral-800 pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {children}
                </div>
            </div>
        </div>
    </div>
);

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    results: Record<string, FormulaResult>;
    isSaving: boolean;
}> = ({ isOpen, onClose, onConfirm, results, isSaving }) => {
    if (!isOpen) return null;

    // FIX: Using a type guard with an explicit type for the parameter `r` ensures TypeScript correctly narrows the type of `activeResults`,
    // which resolves the issue of `result` being inferred as `unknown` in the `.map()` function.
    const activeResults = Object.values(results).filter(
        (r: FormulaResult): r is FormulaResult & { output: NonNullable<FormulaResult['output']> } =>
          r.isActive && !!r.output && !!r.output.variableName
      );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-neutral-900 rounded-lg shadow-2xl border border-neutral-800 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-neutral-800">
                    <h2 className="text-2xl font-bold text-white">Revisão da Peça</h2>
                    <p className="text-neutral-400">As fórmulas geraram os seguintes resultados. Confirme para salvar.</p>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {activeResults.length > 0 ? (
                        <ul className="space-y-3">
                            {activeResults.map((result, index) => (
                                <li key={index} className="bg-neutral-800 p-3 rounded-md flex justify-between items-center font-mono">
                                    {/* FIX: Removed non-null assertion (!) as the type guard guarantees `output` exists. */}
                                    <span className="text-rose-400">{result.output.variableName}</span>
                                    {/* FIX: Removed non-null assertion (!) as the type guard guarantees `output` exists. */}
                                    <span className="text-green-300 font-bold">{String(result.output.value)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-neutral-400 text-center">Nenhum resultado gerado pelas fórmulas.</p>
                    )}
                </div>
                <div className="p-4 bg-neutral-950 rounded-b-lg flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 transition-colors" disabled={isSaving}>Cancelar</button>
                    <button onClick={onConfirm} className="px-6 py-2 bg-rose-800 text-white font-semibold rounded-md hover:bg-rose-700 transition-colors flex items-center justify-center w-40" disabled={isSaving}>
                        {isSaving ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Confirmar e Salvar'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const DashboardTab: React.FC = () => {
    const [config, setConfig] = useState<ProductionConfig>(initialState);
    const [isTaliscaOpen, setIsTaliscaOpen] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [formulaResults, setFormulaResults] = useState<Record<string, FormulaResult>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        const newConfig = { ...config, [name]: value };

        if (name === 'material') {
            const mat = value as 'Pvc' | 'Pu';
            newConfig.thickness = thicknessOptions[mat]?.[0] || ''; 
        }

        setConfig(newConfig);
    };
    
    const handleToggleTalisca = () => {
        const nextState = !isTaliscaOpen;
        setIsTaliscaOpen(nextState);
        if (!nextState) {
            setConfig(prev => ({...prev, ...initialCleatState}));
        } else {
            setConfig(prev => ({
                ...prev,
                cleatHeight: prev.cleatHeight || cleatHeightOptions[0],
                cleatFormat: prev.cleatFormat || cleatFormatOptions[0],
            }));
        }
    };

    const handleCheckFormulas = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!config.os.trim() || !config.name.trim()){
            alert('O nome da peça e o número da OS são obrigatórios.');
            return;
        }
        setIsChecking(true);
        try {
            const [inventoryItems, formulas] = await Promise.all([
                firebaseService.getInventory(),
                firebaseService.getFormulas(),
            ]);

            const inventoryContext = inventoryItems.reduce((acc, item) => {
                acc[item.variableName] = item.total;
                return acc;
            }, {} as Record<string, number>);

            const pieceContext: Record<string, string | number> = {
                nome: config.name,
                os: config.os,
                comprimento: Number(config.length) || 0,
                largura: Number(config.width) || 0,
                cor: config.color,
                material: config.material,
                textura: config.texture,
                espessura: Number(config.thickness) || 0,
                emenda: config.spliceType,
                talisca_altura: Number(config.cleatHeight) || 0,
                talisca_guia: config.cleatProfile,
                talisca_quantidade: Number(config.cleatQuantity) || 0,
                talisca_passo: Number(config.cleatPitch) || 0,
                talisca_largura: Number(config.cleatWidth) || 0,
                talisca_formato: config.cleatFormat,
                observacao: config.observation || '',
            };

            const fullContext = { ...inventoryContext, ...pieceContext };
            const results = formulaService.evaluateFormulaList(formulas, fullContext);
            setFormulaResults(results);
            setIsConfirmationOpen(true);
        } catch (error) {
            console.error("Failed to check formulas:", error);
            alert('Ocorreu um erro ao verificar as fórmulas.');
        } finally {
            setIsChecking(false);
        }
    };
    
    const handleConfirmSave = async () => {
        setIsSaving(true);
        try {
            const newProductionItem = {
                ...config,
                createdAt: new Date().toISOString(),
            };
            await firebaseService.addProductionItem(newProductionItem);
            alert('Peça salva com sucesso na aba Produção!');
            setConfig(initialState);
            setIsTaliscaOpen(false);
            setIsConfirmationOpen(false);
        } catch (error) {
            console.error("Failed to save production configuration:", error);
            alert('Ocorreu um erro ao salvar a peça.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const currentThicknessOptions = useMemo(() => {
        return config.material ? thicknessOptions[config.material] : [];
    }, [config.material]);
    
    const buttonText = isChecking ? "Verificando..." : "Salvar Peça";

    return (
        <div className="animate-fade-in space-y-6">
            <h1 className="text-3xl font-bold text-white">Nova Peça</h1>
            <form onSubmit={handleCheckFormulas}>
                <div className="space-y-6">
                    <FormSection title="Detalhes da Peça">
                        <FormField label="Nome" className="md:col-span-1">
                           <TextInput type="text" name="name" value={config.name} onChange={handleInputChange} placeholder="" required />
                        </FormField>
                        <FormField label="OS (Ordem de Serviço)" className="md:col-span-1">
                            <TextInput type="text" name="os" value={config.os} onChange={handleInputChange} placeholder="Ex: 2024-001" required />
                        </FormField>
                        <FormField label="Comprimento (mm)">
                            <TextInput type="number" name="length" value={config.length} onChange={handleInputChange} placeholder="Ex: 1500" />
                        </FormField>
                        <FormField label="Largura (mm)">
                            <TextInput type="number" name="width" value={config.width} onChange={handleInputChange} placeholder="Ex: 500" />
                        </FormField>
                        <FormField label="Cor">
                            <SelectInput name="color" value={config.color} onChange={handleInputChange} options={colorOptions} />
                        </FormField>
                        <FormField label="Material">
                            <SelectInput name="material" value={config.material} onChange={handleInputChange} options={materialOptions} />
                        </FormField>
                         <FormField label="Espessura (mm)">
                            <SelectInput name="thickness" value={config.thickness} onChange={handleInputChange} options={currentThicknessOptions} disabled={!config.material} />
                        </FormField>
                        <FormField label="Textura">
                            <SelectInput name="texture" value={config.texture} onChange={handleInputChange} options={textureOptions} />
                        </FormField>
                        <FormField label="Emenda">
                            <SelectInput name="spliceType" value={config.spliceType} onChange={handleInputChange} options={spliceTypeOptions} />
                        </FormField>
                         <FormField label="Observação" className="md:col-span-3">
                            <textarea
                                name="observation"
                                value={config.observation}
                                onChange={handleInputChange}
                                placeholder="Adicione notas ou detalhes importantes sobre a peça..."
                                rows={3}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-600 transition-colors"
                            />
                        </FormField>
                    </FormSection>

                    <Accordion title="Acessórios: Talisca" isOpen={isTaliscaOpen} onToggle={handleToggleTalisca}>
                        <FormField label="Altura">
                           <SelectInput name="cleatHeight" value={config.cleatHeight} onChange={handleInputChange} options={cleatHeightOptions} />
                        </FormField>
                        <FormField label="Talisca/Guia">
                           <SelectInput name="cleatProfile" value={config.cleatProfile} onChange={handleInputChange} options={cleatProfileOptions} />
                        </FormField>
                        <FormField label="Quantidade de Taliscas">
                           <TextInput type="number" name="cleatQuantity" value={config.cleatQuantity} onChange={handleInputChange} placeholder="Nº inteiro" min="0" step="1" />
                        </FormField>
                        <FormField label="Passo">
                           <TextInput type="number" name="cleatPitch" value={config.cleatPitch} onChange={handleInputChange} placeholder="Ex: 200" min="0" />
                        </FormField>
                        <FormField label="Largura Talisca">
                           <TextInput type="number" name="cleatWidth" value={config.cleatWidth} onChange={handleInputChange} placeholder="Ex: 480" min="0" />
                        </FormField>
                        <FormField label="Formato">
                           <SelectInput name="cleatFormat" value={config.cleatFormat} onChange={handleInputChange} options={cleatFormatOptions} />
                        </FormField>
                    </Accordion>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="px-6 py-3 bg-rose-800 text-white font-semibold rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950 focus:ring-rose-600 transition-colors shadow-lg flex items-center justify-center w-40"
                            disabled={isChecking}
                        >
                            {isChecking ? (
                               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                "Salvar Peça"
                            )}
                        </button>
                    </div>
                </div>
            </form>
            <ConfirmationModal 
                isOpen={isConfirmationOpen}
                onClose={() => setIsConfirmationOpen(false)}
                onConfirm={handleConfirmSave}
                results={formulaResults}
                isSaving={isSaving}
            />
        </div>
    );
};

export default DashboardTab;