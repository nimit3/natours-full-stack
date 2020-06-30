/* eslint-disable */
//-------------LOG IN FUNCTION
const login = async (email, password) => {
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
      alert('Logged in successfully!');
      //if we have get data successfully then we will put 1.5 seconds delay and then we will load homepage right away using location.assign('/)
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
    console.log(result);
  } catch (error) {
    alert(error.response.data.message);
  }
};
//http://localhost:3000/api/v1/tours
document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
