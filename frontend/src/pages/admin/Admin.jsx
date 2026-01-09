import React from 'react';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import Categories from './components/Categories';
import ComingSoon from './components/ComingSoon';
import AddProduct from './components/AddProduct';
import './Admin.css';

function Admin() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [productsSubmenuOpen, setProductsSubmenuOpen] = useState(false);

  useEffect(() => {
    if (activeSection === 'product-list' || activeSection === 'categories') {
      setProductsSubmenuOpen(true);
    }
  }, [activeSection]);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'product-list':
        return <ProductList />;
      case 'add-product': 
        return <AddProduct setActiveSection={setActiveSection} />;  
      case 'categories':
        return <Categories />;
      case 'products':
        return (
          <div className="admin-content">
            <div className="content-header">
              <h1>Products</h1>
            </div>
            <p className="coming-soon">Select a subcategory from the sidebar</p>
          </div>
        );
      case 'sales':
        return <ComingSoon title="Sales analytics" />;
      case 'customers':
        return <ComingSoon title="Customer management" />;
      case 'inventory':
        return <ComingSoon title="Inventory management" />;
      case 'notifications':
        return <ComingSoon title="Notifications center" />;
      case 'settings':
        return <ComingSoon title="Settings panel" />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="admin-page">
      <Sidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        productsSubmenuOpen={productsSubmenuOpen}
        setProductsSubmenuOpen={setProductsSubmenuOpen}
      />
      <main className="admin-main">
        <Header activeSection={activeSection} />
        <div className="admin-content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default Admin;

