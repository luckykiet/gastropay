import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../config/paths';
import { createAxios, addSlashAfterUrl } from '../../utils';
import { Promise } from 'bluebird';
import { CONFIG } from '../../config/config';
import { API } from '../../config/api';

function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined' || token === '') {
      navigate(PATHS.LOGIN);
    }
    const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));
    const logout = async () => {
      try {
        const { data: { success, msg } } = await axios.post(
          `${API.AUTH}/${API.LOGOUT}`,
          { token: token }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!success) {
          throw new Error(msg);
        }
        console.log(msg);
        localStorage.removeItem('token');
        navigate(PATHS.LOGIN);
      } catch (err) {
        console.log(err?.response?.data.msg ? err.response.data.msg : err);
      }
    }
    Promise.delay(0).then(logout);
  }, [navigate]);

  return null;
}

export default LogoutPage;
