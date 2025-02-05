import React, { useState } from 'react';
import type { Establishment } from '../../types/configuration';
import PageLayout from '../../components/layout/PageLayout';

const EstablishmentInfo: React.FC = () => {
  const [establishment, setEstablishment] = useState<Establishment>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    photos: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement save logic
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // TODO: Implement image upload logic
    }
  };

  return (
    <PageLayout 
      title="Informations de l'établissement"
      actions={
        <button type="submit" form="establishment-form" className="button-primary">
          Enregistrer
        </button>
      }
    >
      <div className="card">
        <form id="establishment-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--primary-color)]">
                Nom de l'établissement
              </label>
              <input
                type="text"
                id="name"
                value={establishment.name}
                onChange={(e) => setEstablishment({ ...establishment, name: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-[var(--primary-color)]/10 
                         px-4 py-2 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-[var(--primary-color)]">
                Adresse
              </label>
              <textarea
                id="address"
                value={establishment.address}
                onChange={(e) => setEstablishment({ ...establishment, address: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-[var(--primary-color)]/10 
                         px-4 py-2 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[var(--primary-color)]">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={establishment.phone}
                  onChange={(e) => setEstablishment({ ...establishment, phone: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-[var(--primary-color)]/10 
                           px-4 py-2 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--primary-color)]">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={establishment.email}
                  onChange={(e) => setEstablishment({ ...establishment, email: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-[var(--primary-color)]/10 
                           px-4 py-2 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-[var(--primary-color)]">
                Site web
              </label>
              <input
                type="url"
                id="website"
                value={establishment.website}
                onChange={(e) => setEstablishment({ ...establishment, website: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-[var(--primary-color)]/10 
                         px-4 py-2 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[var(--primary-color)]">
                Description
              </label>
              <textarea
                id="description"
                value={establishment.description}
                onChange={(e) => setEstablishment({ ...establishment, description: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-[var(--primary-color)]/10 
                         px-4 py-2 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--primary-color)]">
                Photos
              </label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-[var(--primary-color)]
                         file:mr-4 file:py-2 file:px-4 file:rounded-lg
                         file:border-0 file:text-sm file:font-medium
                         file:bg-[var(--primary-color)]/10 file:text-[var(--primary-color)]
                         hover:file:bg-[var(--primary-color)]/20"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default EstablishmentInfo;
