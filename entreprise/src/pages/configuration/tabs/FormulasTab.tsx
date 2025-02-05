import React, { useState, useEffect } from 'react';
import { Activity } from '../../../types/business/Activity';
import { Formula } from '../../../types/business/Formula';
import { activityService } from '../../../services/activityService';
import formulaService from '../../../services/formulaService';
import FormulaModal from '../../../components/formulas/FormulaModal';

interface FormulasTabProps {
  selectedActivityId: string | null;
  onBack: () => void;
}

const FormulasTab: React.FC<FormulasTabProps> = ({
  selectedActivityId,
  onBack,
}) => {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);

  // Charger les formules de l'activité
  const loadFormulas = async () => {
    if (!selectedActivityId) return;

    try {
      setIsLoading(true);
      const [activityData, formulasData] = await Promise.all([
        activityService.get(selectedActivityId),
        formulaService.getAll(),
      ]);

      setActivity(activityData);
      setFormulas(
        formulasData.filter((f) => f.activityId === selectedActivityId)
      );
    } catch (err) {
      setError('Erreur lors du chargement des formules');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFormulas();
  }, [selectedActivityId]);

  // Gérer la sauvegarde d'une formule
  const handleSaveFormula = async (formula: Formula) => {
    try {
      if (editingFormula) {
        await formulaService.update(editingFormula.id, formula);
      } else {
        await formulaService.create({
          ...formula,
          activityId: selectedActivityId!,
        });
      }
      loadFormulas();
      setIsModalOpen(false);
      setEditingFormula(null);
    } catch (err) {
      setError('Erreur lors de la sauvegarde de la formule');
      console.error(err);
    }
  };

  // Gérer la suppression d'une formule
  const handleDeleteFormula = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette formule ?')) {
      return;
    }

    try {
      await formulaService.delete(id);
      loadFormulas();
    } catch (err) {
      setError('Erreur lors de la suppression de la formule');
      console.error(err);
    }
  };

  if (!selectedActivityId) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-[var(--primary-color)] text-opacity-70 mb-4">
          Veuillez sélectionner une activité
        </p>
        <button onClick={onBack} className="button-secondary">
          Retour aux activités
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={onBack}
            className="text-[var(--primary-color)] hover:text-opacity-70 mb-2 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Retour aux activités
          </button>
          <h1 className="text-2xl font-bold text-[var(--primary-color)]">
            Formules - {activity?.name}
          </h1>
        </div>
        <button
          onClick={() => {
            setEditingFormula(null);
            setIsModalOpen(true);
          }}
          className="button-primary"
        >
          Nouvelle formule
        </button>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg text-red-600">
          {error}
          <button
            className="ml-2 text-sm underline"
            onClick={() => setError(null)}
          >
            Fermer
          </button>
        </div>
      )}

      {/* Liste des formules */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--primary-color)] uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--primary-color)] uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--primary-color)] uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--primary-color)] uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[var(--primary-color)] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {formulas.map((formula) => (
              <tr key={formula.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[var(--primary-color)]">
                    {formula.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-[var(--primary-color)] text-opacity-70">
                    {formula.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[var(--primary-color)]">
                    {formula.price} €
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      formula.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {formula.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setEditingFormula(formula);
                      setIsModalOpen(true);
                    }}
                    className="text-[var(--primary-color)] hover:text-opacity-70 mr-4"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteFormula(formula.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de formule */}
      <FormulaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingFormula(null);
        }}
        onSave={handleSaveFormula}
        formula={editingFormula}
      />
    </div>
  );
};

export default FormulasTab;
