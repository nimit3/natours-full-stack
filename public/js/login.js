/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';
//-------------LOG IN FUNCTION
export const login = async (email, password) => {
  try {
    const result = await axios({
      method: 'POST',
      //type the log in api link that we have defined while desgining log in API
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email: email,
        password: password,
      },
    });
    if (result.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      //if we have get data successfully then we will put 1.5 seconds delay and then we will load homepage right away using location.assign('/)
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
    console.log(result);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });
    //this location.reload(true) will refresh the page once it will receive second fake cookie successfully so cookie's value can be overwritten
    if (res.data.status === 'success') {
      location.replace('/login');
    }
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try once again!');
  }
};
