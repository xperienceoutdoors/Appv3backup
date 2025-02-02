import React from 'react';
import { 
  BriefcaseIcon, 
  CurrencyEuroIcon, 
  UserGroupIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, change }: { 
  title: string; 
  value: string; 
  icon: React.ComponentType<any>;
  change?: string;
}) => (
  <div style={{
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
      <div>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '4px' }}>{title}</p>
        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{value}</p>
        {change && (
          <p style={{ 
            color: change.startsWith('+') ? '#059669' : '#DC2626',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {change} vs mois dernier
          </p>
        )}
      </div>
      <Icon style={{ width: '40px', height: '40px', color: '#6B7280' }} />
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
        Dashboard
      </h1>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        <StatCard
          title="Entreprises actives"
          value="24"
          icon={BriefcaseIcon}
          change="+2"
        />
        <StatCard
          title="Revenus mensuels"
          value="12 400 €"
          icon={CurrencyEuroIcon}
          change="+8.2%"
        />
        <StatCard
          title="Utilisateurs actifs"
          value="142"
          icon={UserGroupIcon}
          change="+12%"
        />
        <StatCard
          title="Taux de conversion"
          value="64%"
          icon={ChartBarIcon}
          change="+5.4%"
        />
      </div>

      {/* Graphiques et autres statistiques à ajouter ici */}
    </div>
  );
};

export default Dashboard;
