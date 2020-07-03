import axios from 'axios';
import { showAlert } from './alerts';

//here 'data' in fn args will be an object containing all the data os user and type will be whether its 'password' or 'data(name and email)'
export const updateSettings = async (data, type) => {
  try {
    const url = type === 'password' ? '/api/v1/users/updateMyPassword' : '/api/v1/users/updateMe';

    const result = await axios({
      method: 'PATCH',
      url: url,
      data: data,
    });
    if (result.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
      window.setTimeout(() => {
        location.assign('/me');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
