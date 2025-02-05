import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Switch } from '@headlessui/react';
import settingsService from '../../services/settingsService';
import PaymentDashboard from '../../components/payment/PaymentDashboard';

interface StripeSettings {
  publicKey: string;
  testMode: boolean;
}

const StripeSettings = () => {
  const [settings, setSettings] = useState<StripeSettings>({
    publicKey: '',
    testMode: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stripeSettings = await settingsService.getStripeSettings();
      setSettings(stripeSettings);
    } catch (error) {
      toast.error('Erreur lors du chargement des paramètres Stripe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await settingsService.updateStripeSettings(settings);
      toast.success('Paramètres Stripe mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des paramètres');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tableau de bord des paiements */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-6">Tableau de bord des paiements</h2>
        <PaymentDashboard />
      </div>

      {/* Paramètres Stripe */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-6">Configuration Stripe</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mode Test
            </label>
            <Switch
              checked={settings.testMode}
              onChange={(checked) => setSettings({ ...settings, testMode: checked })}
              className={`${
                settings.testMode ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full mt-2`}
            >
              <span className="sr-only">Activer le mode test</span>
              <span
                className={`${
                  settings.testMode ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </Switch>
            <p className="mt-1 text-sm text-gray-500">
              En mode test, les transactions ne sont pas réelles
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Clé Publique Stripe
            </label>
            <input
              type="text"
              value={settings.publicKey}
              onChange={(e) => setSettings({ ...settings, publicKey: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder={settings.testMode ? 'pk_test_...' : 'pk_live_...'}
            />
            <p className="mt-1 text-sm text-gray-500">
              Disponible dans votre tableau de bord Stripe sous Développeurs {'>'} Clés API
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  La clé secrète doit être configurée uniquement dans le fichier .env du serveur pour des raisons de sécurité.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StripeSettings;
