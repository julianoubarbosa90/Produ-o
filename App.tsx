
import React, { useState } from 'react';
import Layout from './components/Layout';
import DashboardTab from './components/DashboardTab';
import ProductionTab from './components/ProductionTab';
import InventoryTab from './components/InventoryTab';
import FormulasTab from './components/FormulasTab';
import { TABS } from './constants';
import type { TabID } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabID>(TABS[0].id);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'production':
        return <ProductionTab />;
      case 'inventory':
        return <InventoryTab />;
      case 'formulas':
        return <FormulasTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
