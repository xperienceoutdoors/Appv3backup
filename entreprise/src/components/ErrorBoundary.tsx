import React from 'react';
import { useRouteError } from 'react-router-dom';

const ErrorBoundary: React.FC = () => {
  const error = useRouteError() as any;

  return (
    <div className="min-h-screen bg-[var(--background-light)] flex items-center justify-center p-4">
      <div className="card max-w-lg w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[var(--primary-color)] mb-2">
          Oops! Une erreur est survenue
        </h1>
        <p className="text-[var(--primary-color)] text-opacity-70 mb-6">
          {error?.statusText || error?.message || "Quelque chose s'est mal passé"}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="button-secondary"
          >
            Recharger la page
          </button>
          <button
            onClick={() => window.history.back()}
            className="button-primary"
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
