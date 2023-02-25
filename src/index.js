import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/scss/index.scss';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom";
import { PATHS } from './utils';
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

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (!isAuthenticated && !isLoading) {
    return <Navigate to={PATHS.LOGIN} replace />
  }
  if (isLoading) {
    return <LoadingComponent />;
  }
  return children;
}

const AuthRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={PATHS.DASHBOARD} replace />
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
          path: PATHS.RESTAURANTS,
          element: <RestaurantsPage />
        },
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
    path: PATHS.RESTAURANT,
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [{
      path: PATHS.ID_RESTAURANT,
      element: <RestaurantPage />,
    }]
  },
  {
    path: PATHS.MENU,
    element: <MenuLayout />,
    errorElement: <ErrorPage />,
  },
  {
    path: PATHS.DASHBOARD,
    element: <ProtectedRoute><MerchantLayout /></ProtectedRoute>,
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
