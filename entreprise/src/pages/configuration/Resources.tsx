import React, { useState, useEffect } from 'react';
import { Resource } from '../../types/business/Resource';
import resourceService from '../../services/resourceService';
import ResourceModal from '../../components/resources/ResourceModal';

const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const data = await resourceService.getAll();
      setResources(data);
    } catch (error) {
      console.error('Erreur lors du chargement des ressources:', error);
    }
  };

  const handleSave = async (resourceData: Partial<Resource>) => {
    try {
      if (selectedResource) {
        await resourceService.update(selectedResource.id, {
          ...selectedResource,
          ...resourceData
        });
      } else {
        await resourceService.create({
          name: resourceData.name || '',
          description: resourceData.description,
          totalQuantity: resourceData.totalQuantity || 0,
          capacity: resourceData.capacity,
          isActive: resourceData.isActive ?? true
        });
      }
      await loadResources();
      setIsModalOpen(false);
      setSelectedResource(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la ressource:', error);
    }
  };

  const handleDelete = async (resource: Resource) => {
    try {
      await resourceService.delete(resource.id);
      await loadResources();
      setIsDeleteModalOpen(false);
      setResourceToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de la ressource:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[var(--primary-color)]">Ressources</h1>
        <button
          onClick={() => {
            setSelectedResource(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nouvelle ressource
        </button>
      </div>

      {/* Liste des ressources */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ressource
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantité
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacité
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {resources.map((resource) => (
              <tr key={resource.id} className={!resource.isActive ? 'bg-gray-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                  {resource.description && (
                    <div className="text-sm text-gray-500">{resource.description}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resource.totalQuantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resource.capacity || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      resource.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {resource.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedResource(resource);
                      setIsModalOpen(true);
                    }}
                    className="text-[var(--primary-color)] hover:text-[var(--primary-color-dark)] mr-4"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      setResourceToDelete(resource);
                      setIsDeleteModalOpen(true);
                    }}
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

      {/* Modal de création/modification */}
      <ResourceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedResource(null);
        }}
        onSave={handleSave}
        resource={selectedResource}
      />

      {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && resourceToDelete && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Confirmer la suppression
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Êtes-vous sûr de vouloir supprimer la ressource "{resourceToDelete.name}" ?
                        Cette action est irréversible.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleDelete(resourceToDelete)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Supprimer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setResourceToDelete(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
