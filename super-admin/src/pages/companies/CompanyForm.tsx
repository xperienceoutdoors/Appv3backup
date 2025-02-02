import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Company } from '../../types/company';
import { useCompanyStore } from '../../store/CompanyStore';

const CompanyForm = () => {
  const navigate = useNavigate();
  const addCompany = useCompanyStore((state) => state.addCompany);
  
  const [formData, setFormData] = useState<Partial<Company>>({
    status: 'active',
    subscription: {
      plan: 'basic',
      status: 'active',
      startDate: new Date(),
      price: 99
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Créer un ID unique
    const newCompany: Company = {
      id: Date.now().toString(),
      ...formData as Company,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Ajouter l'entreprise au store
    addCompany(newCompany);
    
    // Rediriger vers la liste
    navigate('/entreprises');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Gérer les champs imbriqués (ex: subscription.plan)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
          Nouvelle entreprise
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {/* Informations de base */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '16px' }}>
            Informations de base
          </h2>
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#374151' }}>
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                name="name"
                required
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#374151' }}>
                Secteur d'activité *
              </label>
              <input
                type="text"
                name="sector"
                required
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '16px' }}>
            Adresse
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#374151' }}>
                Adresse *
              </label>
              <input
                type="text"
                name="address"
                required
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#374151' }}>
                  Code postal *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#374151' }}>
                  Ville *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#374151' }}>
                  Pays *
                </label>
                <input
                  type="text"
                  name="country"
                  required
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '16px' }}>
            Contact
          </h2>
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#374151' }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                required
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#374151' }}>
                Téléphone *
              </label>
              <input
                type="tel"
                name="phone"
                required
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Informations fiscales */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '16px' }}>
            Informations fiscales
          </h2>
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#374151' }}>
                Numéro fiscal *
              </label>
              <input
                type="text"
                name="fiscalNumber"
                required
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#374151' }}>
                Numéro de TVA *
              </label>
              <input
                type="text"
                name="vatNumber"
                required
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Représentant légal */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '16px' }}>
            Représentant légal
          </h2>
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#374151' }}>
                Prénom *
              </label>
              <input
                type="text"
                name="legalRepresentative.firstName"
                required
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#374151' }}>
                Nom *
              </label>
              <input
                type="text"
                name="legalRepresentative.lastName"
                required
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#374151' }}>
                Position *
              </label>
              <input
                type="text"
                name="legalRepresentative.position"
                required
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#374151' }}>
                Email *
              </label>
              <input
                type="email"
                name="legalRepresentative.email"
                required
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#374151' }}>
                Téléphone *
              </label>
              <input
                type="tel"
                name="legalRepresentative.phone"
                required
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Informations complémentaires */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '16px' }}>
            Informations complémentaires
          </h2>
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#374151' }}>
                Nombre d'employés *
              </label>
              <input
                type="number"
                name="employeeCount"
                required
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#374151' }}>
                Chiffre d'affaires annuel (€) *
              </label>
              <input
                type="number"
                name="annualRevenue"
                required
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#374151' }}>
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* Abonnement */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '16px' }}>
            Abonnement
          </h2>
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#374151' }}>
                Plan *
              </label>
              <select
                name="subscription.plan"
                required
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="basic">Basic - 99€/mois</option>
                <option value="premium">Premium - 299€/mois</option>
                <option value="enterprise">Enterprise - 999€/mois</option>
              </select>
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
          <button
            type="button"
            onClick={() => navigate('/entreprises')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              backgroundColor: '#F3F4F6',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              backgroundColor: '#0284C7',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Créer l'entreprise
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;
