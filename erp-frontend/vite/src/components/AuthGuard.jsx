import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from 'hooks/useAuth';

export default function AuthGuard({ children }) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return isLoggedIn ? children : null;
}

AuthGuard.propTypes = { children: PropTypes.node };
