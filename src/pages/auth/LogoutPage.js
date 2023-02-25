import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../utils';

function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    navigate(PATHS.LOGIN);
  }, [navigate]);

  return null;
}

export default LogoutPage;
