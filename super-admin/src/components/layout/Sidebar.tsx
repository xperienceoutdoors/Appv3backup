import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArchiveBoxIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  GiftIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Caisse', href: '/caisse', icon: ArchiveBoxIcon },
    { name: 'Planning', href: '/planning', icon: CalendarIcon },
    { name: 'Réservations', href: '/reservations', icon: ClipboardDocumentListIcon },
    { name: 'Devis', href: '/devis', icon: DocumentTextIcon },
    { name: 'Bons cadeaux', href: '/bons-cadeaux', icon: GiftIcon },
    { name: 'Pilotage', href: '/pilotage', icon: WrenchScrewdriverIcon },
    { name: 'Configuration', href: '/configuration', icon: Cog6ToothIcon },
  ];

  return (
    <aside className="w-64 bg-white border-r">
      <nav className="h-full">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm ${
                    isActive 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3 text-gray-400" aria-hidden="true" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
