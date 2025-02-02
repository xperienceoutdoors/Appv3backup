import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import Dashboard from './pages/Dashboard';
import CompanyList from './pages/companies/CompanyList';
import CompanyForm from './pages/companies/CompanyForm';

const MenuItem = ({ to, icon: Icon, children, indent = false }: { to: string; icon?: any; children: React.ReactNode; indent?: boolean }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <li style={{ marginBottom: '4px' }}>
      <Link
        to={to}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px',
          paddingLeft: indent ? '32px' : '10px',
          color: '#374151',
          textDecoration: 'none',
          borderRadius: '6px',
          backgroundColor: isActive ? '#f3f4f6' : 'transparent',
          fontSize: '14px'
        }}
      >
        {Icon && <Icon style={{ width: '20px', height: '20px' }} />}
        {children}
      </Link>
    </li>
  );
};

const Navigation = () => {
  return (
    <nav style={{
      width: '250px',
      backgroundColor: 'white',
      borderRight: '1px solid #e5e7eb',
      padding: '20px'
    }}>
      {/* Dashboard */}
      <div style={{ marginBottom: '24px' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <MenuItem to="/" icon={HomeIcon}>
            Dashboard
          </MenuItem>
        </ul>
      </div>

      {/* Entreprises */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px' }}>
          Entreprises
        </h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <MenuItem to="/entreprises" icon={BuildingOfficeIcon}>
            Liste des entreprises
          </MenuItem>
          <MenuItem to="/entreprises/abonnements" indent>
            Gestion des abonnements
          </MenuItem>
        </ul>
      </div>

      {/* Gestion */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px' }}>
          Gestion
        </h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <MenuItem to="/utilisateurs" icon={UserGroupIcon}>
            Utilisateurs
          </MenuItem>
          <MenuItem to="/abonnements" icon={CreditCardIcon}>
            Abonnements
          </MenuItem>
        </ul>
      </div>

      {/* Configuration */}
      <div>
        <h2 style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px' }}>
          Configuration
        </h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <MenuItem to="/parametres" icon={Cog6ToothIcon}>
            Paramètres
          </MenuItem>
        </ul>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Header */}
        <header style={{
          height: '60px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px'
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>Back Office</h1>
        </header>

        <div style={{ display: 'flex', flex: 1 }}>
          <Navigation />

          {/* Contenu principal */}
          <main style={{
            flex: 1,
            padding: '20px',
            backgroundColor: '#f9fafb',
            overflowY: 'auto'
          }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/entreprises" element={<CompanyList />} />
              <Route path="/entreprises/nouveau" element={<CompanyForm />} />
              <Route path="/entreprises/:id/modifier" element={<CompanyForm />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
