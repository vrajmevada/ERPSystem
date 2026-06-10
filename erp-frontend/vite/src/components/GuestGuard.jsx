import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from 'hooks/useAuth';

export default function GuestGuard({ children }) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard/default', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return !isLoggedIn ? children : null;
}

GuestGuard.propTypes = { children: PropTypes.node };
