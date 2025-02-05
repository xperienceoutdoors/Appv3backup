import { lazy } from 'react';

// Layouts
const BusinessLayout = lazy(() => import('../layouts/BusinessLayout'));
const ConfigurationLayout = lazy(() => import('../layouts/ConfigurationLayout'));

// Pages principales
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Planning = lazy(() => import('../pages/Planning'));

// Pages de réservation
const SalesTracking = lazy(() => import('../pages/reservations/SalesTracking'));
const Customers = lazy(() => import('../pages/reservations/Customers'));

// Pages de configuration
const Establishment = lazy(() => import('../pages/configuration/Establishment'));
const Legal = lazy(() => import('../pages/configuration/Legal'));
const Resources = lazy(() => import('../pages/configuration/Resources'));
const Activities = lazy(() => import('../pages/configuration/Activities'));
const Periods = lazy(() => import('../pages/configuration/Periods'));
const OptionalSales = lazy(() => import('../pages/configuration/OptionalSales'));
const StripeConfig = lazy(() => import('../pages/configuration/StripeConfig'));

export const routes = [
  {
    path: '/',
    element: BusinessLayout,
    children: [
      {
        path: '/',
        element: Dashboard,
      },
      {
        path: '/planning',
        element: Planning,
      },
      {
        path: '/reservations',
        children: [
          {
            path: 'sales',
            element: SalesTracking,
          },
          {
            path: 'customers',
            element: Customers,
          },
        ],
      },
      {
        path: '/configuration',
        element: ConfigurationLayout,
        children: [
          {
            path: 'establishment',
            element: Establishment,
          },
          {
            path: 'legal',
            element: Legal,
          },
          {
            path: 'resources',
            element: Resources,
          },
          {
            path: 'activities',
            element: Activities,
          },
          {
            path: 'periods',
            element: Periods,
          },
          {
            path: 'optional-sales',
            element: OptionalSales,
          },
          {
            path: 'stripe',
            element: StripeConfig,
          },
        ],
      },
    ],
  },
];

// Types pour le routage
export interface RouteConfig {
  path: string;
  element: React.LazyExoticComponent<React.FC>;
  children?: RouteConfig[];
}

// Fonction utilitaire pour obtenir le titre de la page à partir de la route
export function getPageTitle(path: string): string {
  const routeTitles: { [key: string]: string } = {
    '/': 'Tableau de bord',
    '/planning': 'Planning',
    '/reservations/sales': 'Suivi des ventes',
    '/reservations/customers': 'Fichier client',
    '/configuration/establishment': 'Établissement',
    '/configuration/legal': 'Juridique',
    '/configuration/resources': 'Ressources',
    '/configuration/activities': 'Activités',
    '/configuration/periods': 'Périodes',
    '/configuration/optional-sales': 'Ventes additionnelles',
    '/configuration/stripe': 'Paiement',
  };

  return routeTitles[path] || 'Page non trouvée';
}
