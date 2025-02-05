import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { activityService } from '../../services/activityService';
import { Activity, Formula } from '../../types/business/Activity';
import { toast } from 'react-toastify';
import FormulaModal from '../formulas/FormulaModal';

interface FormulasModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
}

const FormulasModal: React.FC<FormulasModalProps> = ({
  isOpen,
  onClose,
  activityId,
}) => {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setIsLoading(true);
        const data = await activityService.get(activityId);
        if (!data) {
          throw new Error('Activité non trouvée');
        }
        setActivity(data);
      } catch (error) {
        console.error('Error loading activity:', error);
        toast.error('Erreur lors du chargement de l\'activité');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && activityId) {
      loadActivity();
    }
  }, [isOpen, activityId]);

  const handleSaveFormula = async (formula: Formula) => {
    try {
      if (!activity) return;

      const updatedFormulas = editingFormula
        ? activity.formulas.map((f) => (f.id === editingFormula.id ? formula : f))
        : [...(activity.formulas || []), { ...formula, id: crypto.randomUUID() }];

      await activityService.update(activity.id, {
        ...activity,
        formulas: updatedFormulas,
      });

      setActivity({
        ...activity,
        formulas: updatedFormulas,
      });

      setIsFormulaModalOpen(false);
      setEditingFormula(null);
      toast.success('Formule enregistrée avec succès');
    } catch (error) {
      console.error('Error saving formula:', error);
      toast.error('Erreur lors de l\'enregistrement de la formule');
    }
  };

  const handleDeleteFormula = async (formulaId: string) => {
    if (!activity || !window.confirm('Êtes-vous sûr de vouloir supprimer cette formule ?')) {
      return;
    }

    try {
      const updatedFormulas = (activity.formulas || []).filter((f) => f.id !== formulaId);
      await activityService.update(activity.id, {
        ...activity,
        formulas: updatedFormulas,
      });

      setActivity({
        ...activity,
        formulas: updatedFormulas,
      });

      toast.success('Formule supprimée avec succès');
    } catch (error) {
      console.error('Error deleting formula:', error);
      toast.error('Erreur lors de la suppression de la formule');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-[var(--primary-color)]">
              {activity ? `Formules - ${activity.name}` : 'Chargement...'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
              </div>
            ) : activity ? (
              <>
                {/* Liste des formules */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700">
                      Liste des formules
                    </h3>
                    <button
                      onClick={() => {
                        setEditingFormula(null);
                        setIsFormulaModalOpen(true);
                      }}
                      className="button-primary flex items-center text-sm"
                    >
                      <FiPlus className="w-4 h-4 mr-2" />
                      Nouvelle formule
                    </button>
                  </div>

                  <div className="bg-white shadow overflow-hidden rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nom
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Prix
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {!activity.formulas || activity.formulas.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-6 py-4 text-center text-sm text-gray-500"
                            >
                              Aucune formule disponible
                            </td>
                          </tr>
                        ) : (
                          activity.formulas.map((formula) => (
                            <tr key={formula.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {formula.name}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-500 line-clamp-2">
                                  {formula.description}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {formula.price.toFixed(2)} €
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => {
                                    setEditingFormula(formula);
                                    setIsFormulaModalOpen(true);
                                  }}
                                  className="text-[var(--primary-color)] hover:text-[var(--primary-color-dark)] mr-3"
                                >
                                  <FiEdit2 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFormula(formula.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <FiTrash2 className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500">
                Erreur lors du chargement de l'activité
              </div>
            )}
          </div>

          {/* Modal de formule */}
          <FormulaModal
            isOpen={isFormulaModalOpen}
            onClose={() => {
              setIsFormulaModalOpen(false);
              setEditingFormula(null);
            }}
            onSave={handleSaveFormula}
            formula={editingFormula}
          />

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="button-secondary">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormulasModal;
