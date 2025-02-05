import React, { useState } from 'react';
import { generateTestData } from '../services/testData';
import { toast } from 'react-toastify';

const Dashboard: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTestData = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      await generateTestData();
      toast.success("Données de test générées avec succès !");
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la génération des données de test:", error);
      toast.error("Erreur lors de la génération des données de test");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Statistiques journalières */}
        <div className="stats-card">
          <h3 className="stats-label">Aujourd'hui</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="stats-label">Réservations</p>
              <p className="stats-value">12</p>
            </div>
            <div>
              <p className="stats-label">Chiffre d'affaires</p>
              <p className="stats-value">845€</p>
            </div>
          </div>
        </div>

        {/* Activités populaires */}
        <div className="card">
          <h3 className="heading text-lg">Activités populaires</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Kayak</span>
              <span className="font-semibold text-[var(--primary-color)]">45%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Paddle</span>
              <span className="font-semibold text-[var(--primary-color)]">30%</span>
            </div>
          </div>
        </div>

        {/* Prochaines réservations */}
        <div className="card">
          <h3 className="heading text-lg">À venir</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cette semaine</span>
              <span className="font-semibold text-[var(--primary-color)]">28</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ce mois</span>
              <span className="font-semibold text-[var(--primary-color)]">124</span>
            </div>
          </div>
        </div>

        {/* Carte pour les données de test */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Données de test</h2>
          <p className="text-gray-600 mb-4">
            Générer des données de test pour les réservations et les clients.
          </p>
          <button
            onClick={handleGenerateTestData}
            disabled={isGenerating}
            className={`w-full p-3 rounded-lg transition-colors ${
              isGenerating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isGenerating ? "Génération en cours..." : "Générer des données de test"}
          </button>
        </div>

        {/* Graphique des réservations */}
        <div className="card">
          <h3 className="heading text-lg">Vue d'ensemble des réservations</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Graphique des réservations à venir</p>
          </div>
        </div>

        {/* Bouton d'action */}
        <div className="mt-6">
          <button className="button-primary">
            Nouvelle réservation
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
