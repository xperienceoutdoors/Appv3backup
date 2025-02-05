import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity, PaymentMethod } from '../../types/business/Activity';
import { Switch } from '@headlessui/react';
import { toast } from 'react-toastify';

const ActivityPaymentSettings = () => {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [settings, setSettings] = useState({
    allowOnsite: false,
    allowDeposit: false,
    allowFull: true,
    depositPercentage: 30
  });

  useEffect(() => {
    // Simuler le chargement d'une activité
    setActivity({
      id: activityId || '1',
      name: 'Cours de surf',
      description: 'Initiation au surf',
      price: 50,
      duration: 120,
      paymentSettings: {
        allowedMethods: ['full'],
        depositPercentage: 30
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }, [activityId]);

  const handleSave = async () => {
    if (!activity) return;

    const allowedMethods: PaymentMethod[] = [];
    if (settings.allowOnsite) allowedMethods.push('onsite');
    if (settings.allowDeposit) allowedMethods.push('deposit');
    if (settings.allowFull) allowedMethods.push('full');

    const updatedActivity = {
      ...activity,
      paymentSettings: {
        allowedMethods,
        depositPercentage: settings.depositPercentage
      }
    };

    // Simuler la sauvegarde
    console.log('Activité mise à jour:', updatedActivity);
    toast.success('Paramètres de paiement mis à jour');
    
    // Dans un cas réel, vous appelleriez votre API ici
    localStorage.setItem(`activity_${activity.id}`, JSON.stringify(updatedActivity));
  };

  if (!activity) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Configuration des paiements - {activity.name}
      </h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-4">Modalités de paiement</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Paiement sur place</label>
                <p className="text-sm text-gray-500">
                  Permettre le paiement lors de l'activité
                </p>
              </div>
              <Switch
                checked={settings.allowOnsite}
                onChange={(checked) => setSettings(s => ({ ...s, allowOnsite: checked }))}
                className={`${
                  settings.allowOnsite ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span className="sr-only">Activer le paiement sur place</span>
                <span
                  className={`${
                    settings.allowOnsite ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Acompte</label>
                <p className="text-sm text-gray-500">
                  Permettre le paiement d'un acompte
                </p>
              </div>
              <Switch
                checked={settings.allowDeposit}
                onChange={(checked) => setSettings(s => ({ ...s, allowDeposit: checked }))}
                className={`${
                  settings.allowDeposit ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span className="sr-only">Activer le paiement d'acompte</span>
                <span
                  className={`${
                    settings.allowDeposit ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>

            {settings.allowDeposit && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pourcentage de l'acompte
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={settings.depositPercentage}
                  onChange={(e) => setSettings(s => ({
                    ...s,
                    depositPercentage: parseInt(e.target.value) || 30
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Paiement complet</label>
                <p className="text-sm text-gray-500">
                  Permettre le paiement de la totalité
                </p>
              </div>
              <Switch
                checked={settings.allowFull}
                onChange={(checked) => setSettings(s => ({ ...s, allowFull: checked }))}
                className={`${
                  settings.allowFull ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span className="sr-only">Activer le paiement complet</span>
                <span
                  className={`${
                    settings.allowFull ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Enregistrer
          </button>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Test des paiements
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Utilisez ces cartes de test Stripe :</p>
              <ul className="list-disc list-inside mt-1">
                <li>Succès : 4242 4242 4242 4242</li>
                <li>Échec : 4000 0000 0000 0002</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityPaymentSettings;
