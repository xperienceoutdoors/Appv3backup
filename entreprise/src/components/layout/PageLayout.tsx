import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumb?: { text: string; link?: string }[];
  actions?: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  breadcrumb,
  actions,
}) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              {title && (
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              )}
              {breadcrumb && breadcrumb.length > 0 && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  {breadcrumb.map((item, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <FiChevronRight className="mx-2" />}
                      {item.link ? (
                        <Link
                          to={item.link}
                          className="hover:text-[var(--primary-color)]"
                        >
                          {item.text}
                        </Link>
                      ) : (
                        <span>{item.text}</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
            {actions && <div className="flex items-center space-x-4">{actions}</div>}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
