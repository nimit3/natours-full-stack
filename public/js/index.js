/* eslint-disable */

import '@babel/polyfill';
import { login } from './login';
import { displayMap } from './mapbox';
//http://localhost:3000/api/v1/tours

//how tog et value from data-locations attributes from html
//.dataset.name_of_attributes(locations)

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');

//delegation
if (mapBox) {
  const locations = JSON.parse(document.getElementById('map').dataset.locations);
  //   console.log(locations);
  displayMap(locations);
}
if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
