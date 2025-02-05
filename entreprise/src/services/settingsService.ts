const STORAGE_KEY = 'app_settings';
const STRIPE_SETTINGS_KEY = 'stripe_settings';

interface StripeSettings {
  publicKey: string;
  testMode: boolean;
}

interface AppSettings {
  stripe: StripeSettings;
}

const defaultSettings: AppSettings = {
  stripe: {
    publicKey: '',
    testMode: true
  }
};

const settingsService = {
  async getAll(): Promise<AppSettings> {
    const settingsStr = localStorage.getItem(STORAGE_KEY);
    if (!settingsStr) {
      return defaultSettings;
    }
    return JSON.parse(settingsStr);
  },

  getStripeSettings: async (): Promise<StripeSettings> => {
    const settings = localStorage.getItem(STRIPE_SETTINGS_KEY);
    if (settings) {
      return JSON.parse(settings);
    }
    return {
      publicKey: '',
      testMode: true
    };
  },

  updateStripeSettings: async (settings: StripeSettings): Promise<void> => {
    localStorage.setItem(STRIPE_SETTINGS_KEY, JSON.stringify(settings));
  },

  async initialize(): Promise<void> {
    const settings = await this.getAll();
    if (!settings) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
    }
  }
};

export default settingsService;
