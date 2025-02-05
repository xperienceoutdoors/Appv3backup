import { Outlet } from 'react-router-dom';

const ConfigurationLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="p-4">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationLayout;
