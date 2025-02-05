import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { categoryService } from './services/categoryService';
import initializationService from './services/initializationService';

function App() {
  useEffect(() => {
    const init = async () => {
      // Initialiser les services
      await categoryService.initialize();
      await initializationService.initialize();
      console.log('Services initialisés');
    };
    init();
  }, []);

  return <Outlet />;
}

export default App;
