import 'bulma/css/bulma.min.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ErrorPage from './pages/ErrorPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/error',
    element: <ErrorPage />,
    errorElement: <ErrorPage />,
  },])


function App() {
  return (

    <div className='container is-fullhd'>
      <header>
        <Navbar />
      </header>
      <main>
        <div className='container is-widescreen'>
          <RouterProvider router={router} />
        </div>
      </main>
    </div>

  );
}

export default App;
