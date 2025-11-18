export type TabID = 'dashboard' | 'production' | 'inventory' | 'formulas';

export interface InventoryItem {
  id: string;
  displayName: string;
  variableName: string;
  total: number;
  idealTotal: number;
  color: string;
  unit: string;
  orderIndex?: number;
}

export interface InventoryHistoryLog {
  id: string;
  itemId: string;
  itemDisplayName: string;
  change: number;
  newValue: number;
  timestamp: string;
}

export interface ProductionItem {
  id: string;
  createdAt: string;
  name: string;
  os: string;
  length: string;
  width: string;
  color: string;
  material: 'Pvc' | 'Pu' | '';
  texture: string;
  thickness: string;
  spliceType: string;
  cleatHeight: string;
  cleatProfile: string;
  cleatQuantity: string;
  cleatPitch: string;
  cleatWidth: string;
  cleatFormat: string;
  observation?: string;
}

// FIX: Define the Formula type used in FormulasTab and formulaService.
export interface Formula {
  id: string;
  name: string;
  condition: string;
  action: string;
  orderIndex: number;
}