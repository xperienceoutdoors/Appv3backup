import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import BusinessSidebar from '../components/layout/BusinessSidebar';
import { FiChevronRight } from 'react-icons/fi';
import ReservationModal from '../components/reservation/ReservationModal';

const BusinessLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isReservationModalOpen, setReservationModalOpen] = useState(false);

  // Fonction pour obtenir le titre et le fil d'Ariane en fonction de la route
  const getHeaderInfo = () => {
    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);
    
    // Configuration par défaut
    let breadcrumb = [];

    // Mapping des routes vers leurs titres
    const routeTitles: { [key: string]: string } = {
      'planning': 'Planning',
      'reservations': 'Réservations',
      'configuration': 'Configuration',
      'activities': 'Activités',
      'resources': 'Ressources',
      'periods': 'Périodes',
      'establishment': 'Établissement',
      'legal': 'Juridique',
      'optional-sales': 'Ventes additionnelles',
      'stripe': 'Paiement',
      'pos': 'Point de Vente',
    };

    // Construction du fil d'Ariane
    if (parts.length > 0) {
      let currentPath = '';
      breadcrumb = parts.map(part => {
        currentPath += `/${part}`;
        return {
          text: routeTitles[part] || part,
          path: currentPath
        };
      });
    }

    return { breadcrumb };
  };

  const { breadcrumb } = getHeaderInfo();

  return (
    <div className="h-screen flex bg-[var(--background-light)]">
      {/* Sidebar */}
      <BusinessSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center space-x-4">
              {/* Logo placeholder */}
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              
              {/* Breadcrumb */}
              <div className="flex items-center text-sm text-gray-500">
                {breadcrumb.map((item, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <FiChevronRight className="mx-2" />}
                    <span>{item.text}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setReservationModalOpen(true)}
                className="button-primary"
              >
                Réservation
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

        {/* Modals */}
        <ReservationModal
          isOpen={isReservationModalOpen}
          onClose={() => setReservationModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default BusinessLayout;
