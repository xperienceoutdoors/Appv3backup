import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import type { Company } from '../../types/company';
import { useCompanyStore } from '../../store/CompanyStore';

const CompanyList = () => {
  const companies = useCompanyStore((state) => state.companies);

  return (
    <div>
      {/* En-tête avec bouton de création */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
          Entreprises
        </h1>
        <Link 
          to="/entreprises/nouveau"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#0284C7',
            color: 'white',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <PlusIcon style={{ width: '20px', height: '20px' }} />
          Nouvelle entreprise
        </Link>
      </div>

      {/* Liste des entreprises */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '14px', color: '#6B7280' }}>Entreprise</th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '14px', color: '#6B7280' }}>Statut</th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '14px', color: '#6B7280' }}>Abonnement</th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '14px', color: '#6B7280' }}>Contact</th>
              <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '14px', color: '#6B7280' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
                  Aucune entreprise enregistrée
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{company.name}</div>
                      <div style={{ fontSize: '14px', color: '#6B7280' }}>{company.city}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: company.status === 'active' ? '#DEF7EC' : '#FDE8E8',
                      color: company.status === 'active' ? '#03543F' : '#9B1C1C'
                    }}>
                      {company.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{company.subscription.plan}</div>
                      <div style={{ fontSize: '14px', color: '#6B7280' }}>
                        {company.subscription.price}€/mois
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div>
                      <div>{company.email}</div>
                      <div style={{ fontSize: '14px', color: '#6B7280' }}>{company.phone}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Link
                        to={`/entreprises/${company.id}/modifier`}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          color: '#4B5563',
                          backgroundColor: '#F3F4F6'
                        }}
                      >
                        <PencilIcon style={{ width: '20px', height: '20px' }} />
                      </Link>
                      <Link
                        to={`/entreprises/${company.id}/dashboard`}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          color: '#4B5563',
                          backgroundColor: '#F3F4F6'
                        }}
                      >
                        <ChartBarIcon style={{ width: '20px', height: '20px' }} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyList;
