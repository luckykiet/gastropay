import 'bulma/css/bulma.min.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ErrorPage from './pages/ErrorPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <ErrorPage />,
  },])

function App() {
  return (
    <div className="container is-widescreen">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
