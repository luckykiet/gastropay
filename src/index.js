import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/scss/index.scss';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { paths } from './utils';
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
import MenuPage from './pages/guest/MenuPage';
import MenuLayout from './components/layouts/MenuLayout';

const router = createBrowserRouter([
  {
    path: paths.HOME,
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [{
      children: [
        {
          path: "",
          element: <HomePage />
        },
        {
          path: paths.ABOUT,
          element: <AboutPage />
        }, {
          path: paths.CONTACT,
          element: <ContactPage />
        },
        {
          path: paths.REGISTRATION,
          element: <RegisterPage />
        },
        {
          path: paths.FORGOTTEN_PASS,
          element: <ForgottenPasswordPage />
        },
        {
          path: paths.RESTAURANTS,
          element: <RestaurantsPage />
        },
        {
          path: paths.RESTAURANT,
          children: [{
            path: paths.ID_RESTAURANT,
            element: <RestaurantPage />,
          }]
        }
      ],
    }]
  }, {
    path: paths.LOGIN,
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: paths.MENU,
    element: <MenuLayout />,
    errorElement: <ErrorPage />,
    children: [{
      path: paths.ID_RESTAURANT,
      element: <MenuPage />
    }]
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
