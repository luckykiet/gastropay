import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/scss/index.scss';
import reportWebVitals from './reportWebVitals';
import RootLayout from './components/layouts/RootLayout';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ErrorPage from './pages/ErrorPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { paths } from './utils';

const router = createBrowserRouter([
  {
    path: paths.HOME,
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [{
      children: [
        {
          path: "",
          element: <HomePage />,
          errorElement: <ErrorPage />,
        },
        {
          path: paths.ABOUT,
          element: <AboutPage />,
          errorElement: <ErrorPage />,
        }, {
          path: paths.CONTACT,
          element: <ContactPage />,
          errorElement: <ErrorPage />,
        },
        {
          path: paths.LOGIN,
          element: <LoginPage />,
          errorElement: <ErrorPage />,
        },
      ],
    }]

  },
]);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RouterProvider router={router} />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
