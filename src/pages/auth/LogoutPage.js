import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config/config';

function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    navigate(config.PATHS.ROUTERS.LOGIN);
  }, [navigate]);

  return null;
}

export default LogoutPage;
