import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  CogIcon,
  BuildingOfficeIcon,
  CubeIcon,
  BoltIcon,
  TagIcon,
  ClockIcon,
  CreditCardIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<any>;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  { name: 'Tableau de bord', href: '/', icon: HomeIcon },
  { name: 'Planning', href: '/planning', icon: CalendarIcon },
  { name: 'Point de Vente', href: '/pos', icon: ShoppingCartIcon },
  {
    name: 'Réservations',
    icon: UserGroupIcon,
    children: [
      {
        name: 'Suivi des ventes',
        href: '/reservations/sales',
        icon: TagIcon,
      },
      {
        name: 'Fichier client',
        href: '/reservations/customers',
        icon: UserGroupIcon,
      },
    ],
  },
  {
    name: 'Configuration',
    icon: CogIcon,
    children: [
      {
        name: 'Établissement',
        href: '/configuration/establishment',
        icon: BuildingOfficeIcon,
      },
      {
        name: 'Juridique',
        href: '/configuration/legal',
        icon: BuildingOfficeIcon,
      },
      {
        name: 'Ressources',
        href: '/configuration/resources',
        icon: CubeIcon,
      },
      {
        name: 'Activités',
        href: '/configuration/activities',
        icon: BoltIcon,
      },
      {
        name: 'Périodes',
        href: '/configuration/periods',
        icon: ClockIcon,
      },
      {
        name: 'Ventes additionnelles',
        href: '/configuration/optional-sales',
        icon: TagIcon,
      },
      {
        name: 'Paiement',
        href: '/configuration/stripe',
        icon: CreditCardIcon,
      }
    ],
  },
];

const BusinessSidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    // Vérifier si le chemin actuel commence par le chemin de l'item
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  const renderNavItem = (item: NavigationItem) => {
    const Icon = item.icon;

    if (item.children) {
      return (
        <div key={item.name} className="space-y-1">
          <div className="flex items-center px-3 py-2 text-sm font-medium text-[var(--primary-color)]">
            <Icon className="flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
            <span className="truncate">{item.name}</span>
          </div>
          <div className="ml-4 border-l border-[var(--primary-color)]/10 pl-3 space-y-1">
            {item.children.map((child) => (
              <NavLink
                key={child.href}
                to={child.href || ''}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-[var(--primary-color)] text-white'
                      : 'text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10'
                  }`
                }
              >
                {child.icon && (
                  <child.icon
                    className="flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                    aria-hidden="true"
                  />
                )}
                <span className="truncate">{child.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      );
    }

    return (
      <NavLink
        key={item.href}
        to={item.href || ''}
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
            isActive
              ? 'bg-[var(--primary-color)] text-white'
              : 'text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10'
          }`
        }
      >
        <Icon className="flex-shrink-0 -ml-1 mr-3 h-6 w-6" aria-hidden="true" />
        <span className="truncate">{item.name}</span>
      </NavLink>
    );
  };

  return (
    <aside className="flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
        <span className="text-lg font-semibold text-[var(--primary-color)]">
          Backoffice Entreprise
        </span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => renderNavItem(item))}
      </nav>
    </aside>
  );
};

export default BusinessSidebar;
