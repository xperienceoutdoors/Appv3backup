import React, { useState, useEffect } from 'react';
import { Category } from '../../../types/business/Category';
import { categoryService } from '../../../services/categoryService';
import CategoryModal from '../../../components/categories/CategoryModal';
import { FiEdit2, FiTrash2, FiList } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface CategoriesTabProps {
  onCategorySelect?: (categoryId: string) => void;
}

const CategoriesTab: React.FC<CategoriesTabProps> = ({ onCategorySelect }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Charger les catégories
  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError('Erreur lors du chargement des catégories');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Gérer la sauvegarde d'une catégorie
  const handleSaveCategory = async (category: Category) => {
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, category);
      } else {
        await categoryService.create(category);
      }
      loadCategories();
      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      setError('Erreur lors de la sauvegarde de la catégorie');
      console.error(err);
    }
  };

  // Gérer la suppression d'une catégorie
  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    try {
      await categoryService.delete(categoryId);
      loadCategories();
    } catch (err) {
      setError('Erreur lors de la suppression de la catégorie');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4">{error}</div>
      )}

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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                    {onCategorySelect && (
                      <button
                        onClick={() => {
                          onCategorySelect(category.id);
                          navigate(`/configuration/activities/category/${category.id}`, {
                            state: { categoryName: category.name }
                          });
                        }}
                        className="text-xs text-[var(--primary-color)] hover:text-[var(--primary-color-dark)] mt-1 flex items-center"
                      >
                        <FiList className="w-4 h-4 mr-1" />
                        Voir les activités
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 line-clamp-2">
                    {category.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setIsModalOpen(true);
                    }}
                    className="text-[var(--primary-color)] hover:text-[var(--primary-color-dark)] mr-3"
                  >
                    <FiEdit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        category={editingCategory}
      />
    </div>
  );
};

export default CategoriesTab;
