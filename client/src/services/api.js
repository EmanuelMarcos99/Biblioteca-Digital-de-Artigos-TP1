import axios from 'axios';

const api = axios.create({
  // Use o URL onde o seu servidor backend está a correr.
  baseURL: 'http://localhost:3001/api', 
});

export default api;
