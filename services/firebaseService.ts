import type { InventoryItem, ProductionItem, InventoryHistoryLog, Formula } from '../types';
import { db } from './firebaseConfig';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy,
  where,
  Timestamp,
  writeBatch
} from 'firebase/firestore';

const inventoryCollectionRef = collection(db, 'inventory');
const productionCollectionRef = collection(db, 'production');
const inventoryHistoryCollectionRef = collection(db, 'inventory_history');
// FIX: Add a collection reference for formulas.
const formulasCollectionRef = collection(db, 'formulas');

class FirebaseService {
  // --- Inventory ---
  async getInventory(): Promise<InventoryItem[]> {
    const q = query(inventoryCollectionRef, orderBy("displayName"));
    const data = await getDocs(q);
    return data.docs.map(doc => ({ unit: 'un', ...doc.data(), id: doc.id } as InventoryItem));
  }

  async addInventoryItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    const docRef = await addDoc(inventoryCollectionRef, item);
    return { ...item, id: docRef.id };
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<void> {
    const itemDoc = doc(db, 'inventory', id);
    await updateDoc(itemDoc, updates);
  }

  async updateInventoryOrder(updates: { id: string, orderIndex: number }[]): Promise<void> {
    if (updates.length === 0) return;
    const batch = writeBatch(db);
    updates.forEach(update => {
      const docRef = doc(db, 'inventory', update.id);
      batch.update(docRef, { orderIndex: update.orderIndex });
    });
    await batch.commit();
  }

  async deleteInventoryItem(id: string): Promise<void> {
    const itemDoc = doc(db, 'inventory', id);
    await deleteDoc(itemDoc);
  }
  
  // --- Inventory History ---
  async logInventoryAdjustment(log: Omit<InventoryHistoryLog, 'id'>): Promise<void> {
    await addDoc(inventoryHistoryCollectionRef, {
        ...log,
        timestamp: Timestamp.fromDate(new Date(log.timestamp))
    });
  }

  async getInventoryHistory(itemId: string): Promise<InventoryHistoryLog[]> {
    const q = query(
        inventoryHistoryCollectionRef, 
        where("itemId", "==", itemId), 
        orderBy("timestamp", "desc")
    );
    const data = await getDocs(q);
    return data.docs.map(doc => {
        const docData = doc.data();
        return { 
            ...docData, 
            id: doc.id,
            timestamp: (docData.timestamp as Timestamp).toDate().toISOString()
        } as InventoryHistoryLog
    });
  }

  // --- Production ---
  async getProductionItems(): Promise<ProductionItem[]> {
    const q = query(productionCollectionRef, orderBy("createdAt", "desc"));
    const data = await getDocs(q);
    return data.docs.map(doc => ({ ...doc.data(), id: doc.id } as ProductionItem));
  }

  async addProductionItem(item: Omit<ProductionItem, 'id'>): Promise<ProductionItem> {
    const docRef = await addDoc(productionCollectionRef, item);
    return { ...item, id: docRef.id };
  }

  async deleteProductionItem(id: string): Promise<void> {
    const itemDoc = doc(db, 'production', id);
    await deleteDoc(itemDoc);
  }

  // FIX: Implement missing Firebase service methods for formulas.
  // --- Formulas ---
  async getFormulas(): Promise<Formula[]> {
    const q = query(formulasCollectionRef, orderBy("orderIndex"));
    const data = await getDocs(q);
    return data.docs.map(doc => ({ ...doc.data(), id: doc.id } as Formula));
  }

  async addFormula(formula: Omit<Formula, 'id'>): Promise<Formula> {
    const docRef = await addDoc(formulasCollectionRef, formula);
    return { ...formula, id: docRef.id };
  }

  async updateFormula(id: string, updates: Partial<Omit<Formula, 'id'>>): Promise<void> {
    const formulaDoc = doc(db, 'formulas', id);
    await updateDoc(formulaDoc, updates);
  }

  async deleteFormula(id: string): Promise<void> {
    const formulaDoc = doc(db, 'formulas', id);
    await deleteDoc(formulaDoc);
  }

  async updateFormulaOrder(updates: { id: string, orderIndex: number }[]): Promise<void> {
    if (updates.length === 0) return;
    const batch = writeBatch(db);
    updates.forEach(update => {
      const docRef = doc(db, 'formulas', update.id);
      batch.update(docRef, { orderIndex: update.orderIndex });
    });
    await batch.commit();
  }
}

export const firebaseService = new FirebaseService();