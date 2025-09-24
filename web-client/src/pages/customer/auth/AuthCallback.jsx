import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useToast } from '../../../utils/alert-utils/ToastUtil';
import { setLoginCustomer } from '../../../redux/customer/customerSlice';
import { userAPI } from '../../../services';

function AuthCallback() {
  const toast = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        localStorage.setItem('token', token);

        // Fetch user details using the token and ID
        axios.get(`${userAPI.base}/customer/${decoded.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
          const user = response.data;
          localStorage.setItem('user', JSON.stringify({
            id: user._id,
            name: user.name,
            username: user.username,
          }));

          dispatch(setLoginCustomer({
            id: user._id,
            name: user.name,
            username: user.username,
          }));

          toast.success('Login successful');
          navigate('/customer');
        }).catch((error) => {
          console.error('Error fetching user:', error);
          toast.error('Error fetching user details');
          navigate('/auth/login');
        });
      } catch (error) {
        console.error('Invalid token:', error);
        toast.error('Invalid token');
        navigate('/auth/login');
      }
    } else {
      toast.error('No token provided');
      navigate('/auth/login');
    }
  }, [dispatch, navigate, toast]);

  return <div>Loading...</div>;
}

export default AuthCallback;