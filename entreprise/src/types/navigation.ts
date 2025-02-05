import { IconType } from 'react-icons';
import {
  FiHome,
  FiCalendar,
  FiSettings,
  FiBookOpen,
  FiUsers,
  FiShoppingBag,
  FiInfo,
  FiFileText,
  FiBox,
  FiActivity,
  FiClock,
  FiPackage
} from 'react-icons/fi';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: IconType;
  children?: NavigationItem[];
}

export const navigation: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    path: '/',
    icon: FiHome
  },
  {
    id: 'planning',
    label: 'Planning',
    path: '/planning',
    icon: FiCalendar
  },
  {
    id: 'reservations',
    label: 'Réservations',
    path: '/reservations',
    icon: FiBookOpen,
    children: [
      {
        id: 'sales',
        label: 'Suivi des ventes',
        path: '/reservations/sales',
        icon: FiShoppingBag
      },
      {
        id: 'customers',
        label: 'Fichier client',
        path: '/reservations/customers',
        icon: FiUsers
      }
    ]
  },
  {
    id: 'configuration',
    label: 'Configuration',
    path: '/configuration',
    icon: FiSettings,
    children: [
      {
        id: 'establishment',
        label: 'Établissement',
        path: '/configuration/establishment',
        icon: FiInfo
      },
      {
        id: 'legal',
        label: 'Mentions légales',
        path: '/configuration/legal',
        icon: FiFileText
      },
      {
        id: 'resources',
        label: 'Ressources',
        path: '/configuration/resources',
        icon: FiBox
      },
      {
        id: 'activities',
        label: 'Activités',
        path: '/configuration/activities',
        icon: FiActivity
      },
      {
        id: 'periods',
        label: 'Périodes',
        path: '/configuration/periods',
        icon: FiClock
      },
      {
        id: 'optional-sales',
        label: 'Ventes additionnelles',
        path: '/configuration/optional-sales',
        icon: FiPackage
      }
    ]
  }
];
