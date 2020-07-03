import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const result = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    if (result.data.status === 'success') {
      showAlert('success', 'Sign up successfully!');
      //if we have get data successfully then we will put 1.5 seconds delay and then we will load homepage right away using location.assign('/)
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    // console.log(err.response.data.message);
    showAlert('error', err.response.data.message);
  }
};
