import { createBrowserRouter, Navigate } from 'react-router-dom';
import BusinessLayout from './layouts/BusinessLayout';
import Dashboard from './pages/Dashboard';
import Planning from './pages/Planning';
import SalesTracking from './pages/sales/SalesTracking';
import Customers from './pages/Customers';
import EstablishmentInfo from './pages/configuration/EstablishmentInfo';
import Legal from './pages/configuration/Legal';
import Resources from './pages/configuration/Resources';
import Activities from './pages/configuration/Activities';
import Periods from './pages/configuration/Periods';
import OptionalSales from './pages/configuration/OptionalSales';
import StripeSettings from './pages/configuration/StripeSettings';
import ActivityPaymentSettings from './pages/configuration/ActivityPaymentSettings';
import ActivityFormulas from './pages/configuration/ActivityFormulas';
import ActivityFormulaForm from './pages/configuration/ActivityFormulaForm';
import ErrorBoundary from './components/ErrorBoundary';
import ConfigurationLayout from './layouts/ConfigurationLayout';
import PointOfSale from './pages/pos/PointOfSale';

const router = createBrowserRouter([
  {
    path: '/',
    element: <BusinessLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
        errorElement: <ErrorBoundary />
      },
      {
        path: '/planning',
        element: <Planning />,
        errorElement: <ErrorBoundary />
      },
      {
        path: '/pos',
        element: <PointOfSale />,
        errorElement: <ErrorBoundary />
      },
      {
        path: 'reservations',
        children: [
          {
            index: true,
            element: <Navigate to="sales" replace />,
            errorElement: <ErrorBoundary />
          },
          {
            path: 'sales',
            element: <SalesTracking />,
            errorElement: <ErrorBoundary />
          },
          {
            path: 'customers',
            element: <Customers />,
            errorElement: <ErrorBoundary />
          }
        ]
      },
      {
        path: 'configuration',
        element: <ConfigurationLayout />,
        errorElement: <ErrorBoundary />,
        children: [
          {
            path: '/configuration',
            element: <Navigate to="/configuration/establishment" replace />
          },
          {
            path: '/configuration/establishment',
            element: <EstablishmentInfo />,
            errorElement: <ErrorBoundary />
          },
          {
            path: '/configuration/legal',
            element: <Legal />,
            errorElement: <ErrorBoundary />
          },
          {
            path: '/configuration/resources',
            element: <Resources />,
            errorElement: <ErrorBoundary />
          },
          {
            path: '/configuration/activities',
            element: <Activities />,
            errorElement: <ErrorBoundary />
          },
          {
            path: '/configuration/activities/categories',
            element: <Activities />,
            errorElement: <ErrorBoundary />
          },
          {
            path: '/configuration/periods',
            element: <Periods />,
            errorElement: <ErrorBoundary />
          },
          {
            path: '/configuration/optional-sales',
            element: <OptionalSales />,
            errorElement: <ErrorBoundary />
          },
          {
            path: '/configuration/stripe',
            element: <StripeSettings />,
            errorElement: <ErrorBoundary />
          },
          {
            path: '/configuration/payment-settings',
            element: <ActivityPaymentSettings />,
            errorElement: <ErrorBoundary />
          },
          {
            path: '/configuration/formulas',
            element: <ActivityFormulas />,
            errorElement: <ErrorBoundary />
          },
          {
            path: '/configuration/formulas/:activityId',
            element: <ActivityFormulaForm />,
            errorElement: <ErrorBoundary />
          }
        ]
      }
    ]
  }
]);

export default router;
