import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/scss/index.scss';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom";
import reportWebVitals from './reportWebVitals';
import RootLayout from './components/layouts/RootLayout';
import AboutPage from './pages/guest/AboutPage';
import ContactPage from './pages/guest/ContactPage';
import ErrorPage from './pages/ErrorPage';
import HomePage from './pages/guest/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgottenPasswordPage from './pages/auth/ForgottenPasswordPage';
import RestaurantsPage from './pages/guest/RestaurantsPage';
import RestaurantPage from './pages/guest/RestaurantPage';
import MenuLayout from './components/layouts/MenuLayout';
import MerchantLayout from './components/layouts/MerchantLayout';
import LogoutPage from './pages/auth/LogoutPage';
import useAuth from './pages/auth/useAuth';
import DashboardPage from './pages/merchant/DashboardPage';
import ProfilePage from './pages/merchant/ProfilePage';
import TransactionPage from './pages/guest/TransactionPage';
import PaymentPage from './pages/guest/PaymentPage';
import TransactionPanelPage from './pages/merchant/panel/TransactionPanelPage';
import ProgressBar from './components/ProgressBar';
import AddPanelPage from './pages/merchant/panel/AddPanelPage';
import EditPanelPage from './pages/merchant/panel/EditPanelPage';
import ProfilePanel from './pages/merchant/profile/ProfilePanel';
import ComgatePanel from './pages/merchant/profile/ComgatePanel';
import { PATHS } from './config/paths';
import CsobPanel from './pages/merchant/profile/CsobPanel';
import RenewPasswordPage from './pages/auth/RenewPasswordPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, error, expirationTime } = useAuth();
  const currentTime = Date.now() / 1000;

  if (error || (!isAuthenticated && !isLoading)) {
    return <Navigate to={PATHS.LOGIN} replace />;
  }

  if (expirationTime && expirationTime < currentTime) {
    localStorage.removeItem('token');
    return <Navigate to={PATHS.LOGIN} replace />;
  }

  if (isLoading) {
    return <ProgressBar />;
  }

  return children;
};

const AuthRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={PATHS.MERCHANT} replace />
  }
  return children;
}

const router = createBrowserRouter([
  {
    path: PATHS.HOME,
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [{
      children: [
        {
          path: "",
          element: <HomePage />
        },
        {
          path: PATHS.ABOUT,
          element: <AboutPage />
        }, {
          path: PATHS.CONTACT,
          element: <ContactPage />
        },
        {
          path: PATHS.REGISTRATION,
          element: <AuthRoute><RegisterPage /></AuthRoute>
        },
        {
          path: PATHS.FORGOTTEN_PASS,
          element: <ForgottenPasswordPage />
        },
        {
          path: PATHS.CHANGE_PASSWORD + "/" + PATHS.PASS_RENEW_TOKEN,
          element: <RenewPasswordPage />
        },
        {
          path: PATHS.RESTAURANTS,
          element: <RestaurantsPage />
        },
        {
          path: PATHS.RESTAURANT + "/" + PATHS.ID_RESTAURANT,
          element: <RestaurantPage />,
        },
        {
          path: PATHS.TRANSACTION + "/" + PATHS.ID_TRANSACTION,
          element: <TransactionPage />,
        },
        {
          path: PATHS.PAYMENT,
          element: <PaymentPage />,
        }
      ],
    }]
  }, {
    path: PATHS.LOGIN,
    element: <AuthRoute><LoginPage /></AuthRoute>,
    errorElement: <ErrorPage />,
  }, {
    path: PATHS.LOGOUT,
    element: <LogoutPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: PATHS.MENU,
    element: <MenuLayout />,
    errorElement: <ErrorPage />,
  },
  {
    path: PATHS.MERCHANT,
    element: <ProtectedRoute><MerchantLayout /></ProtectedRoute>,
    children: [
      {
        path: "",
        element: <DashboardPage />,
        children: [
          {
            path: PATHS.RESTAURANT_EDIT + '/' + PATHS.ID_RESTAURANT,
            element: <EditPanelPage />,
          },
          {
            path: PATHS.RESTAURANT_ADD,
            element: <AddPanelPage />,
          },
          {
            path: PATHS.RESTAURANT_TRANSACTION + '/' + PATHS.ID_RESTAURANT,
            element: <TransactionPanelPage />,
          }
        ]
      },
      {
        path: PATHS.PROFILE,
        element: <ProfilePage />,
        children: [{
          path: "",
          element: <ProfilePanel />,
        },
        {
          path: PATHS.COMGATE,
          element: <ComgatePanel />,
        },
        {
          path: PATHS.CSOB,
          element: <CsobPanel />,
        }
        ]
      }
    ],
    errorElement: <ErrorPage />,
  }
]);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RouterProvider router={router} />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
