import React, { useState } from 'react';

const Legal: React.FC = () => {
  const [terms, setTerms] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement save logic
    setIsDirty(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Conditions Générales de Vente</h2>
        {isDirty && (
          <span className="text-sm text-amber-600">
            ⚠️ Modifications non enregistrées
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Les CGV seront automatiquement intégrées à tous les devis générés par l'application.
            </p>
          </div>

          <textarea
            value={terms}
            onChange={(e) => {
              setTerms(e.target.value);
              setIsDirty(true);
            }}
            rows={20}
            className="w-full p-4 border border-gray-300 rounded-lg font-mono text-sm"
            placeholder="Saisissez vos conditions générales de vente ici..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              // TODO: Implement reset logic
              setIsDirty(false);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={!isDirty}
          >
            Annuler les modifications
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={!isDirty}
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default Legal;
