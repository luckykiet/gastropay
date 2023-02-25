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
import LoadingComponent from './components/LoadingComponent';
import DashboardPage from './pages/merchant/DashboardPage';
import config from './config/config';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (!isAuthenticated && !isLoading) {
    return <Navigate to={config.config.PATHS.ROUTERS.LOGIN} replace />
  }
  if (isLoading) {
    return <LoadingComponent />;
  }
  return children;
}

const AuthRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={config.PATHS.ROUTERS.DASHBOARD} replace />
  }
  return children;
}

const router = createBrowserRouter([
  {
    path: config.PATHS.ROUTERS.HOME,
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [{
      children: [
        {
          path: "",
          element: <HomePage />
        },
        {
          path: config.PATHS.ROUTERS.ABOUT,
          element: <AboutPage />
        }, {
          path: config.PATHS.ROUTERS.CONTACT,
          element: <ContactPage />
        },
        {
          path: config.PATHS.ROUTERS.REGISTRATION,
          element: <AuthRoute><RegisterPage /></AuthRoute>
        },
        {
          path: config.PATHS.ROUTERS.FORGOTTEN_PASS,
          element: <ForgottenPasswordPage />
        },
        {
          path: config.PATHS.ROUTERS.RESTAURANTS,
          element: <RestaurantsPage />
        },
      ],
    }]
  }, {
    path: config.PATHS.ROUTERS.LOGIN,
    element: <AuthRoute><LoginPage /></AuthRoute>,
    errorElement: <ErrorPage />,
  }, {
    path: config.PATHS.ROUTERS.LOGOUT,
    element: <LogoutPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: config.PATHS.ROUTERS.RESTAURANT,
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [{
      path: config.PATHS.ROUTERS.ID_RESTAURANT,
      element: <RestaurantPage />,
    }]
  },
  {
    path: config.PATHS.ROUTERS.MENU,
    element: <MenuLayout />,
    errorElement: <ErrorPage />,
  },
  {
    path: config.PATHS.ROUTERS.DASHBOARD,
    element: <ProtectedRoute><MerchantLayout /></ProtectedRoute>,
    children: [{
      path: "",
      element: <DashboardPage />,
    }],
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
