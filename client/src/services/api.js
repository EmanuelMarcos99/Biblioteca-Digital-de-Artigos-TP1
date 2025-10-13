import axios from 'axios';

// --- ATENÇÃO: POTENCIAL CONFLITO DE PORTA ---
// O seu frontend (React) corre por defeito na porta 3000.
// O seu backend (Node.js) também está configurado para correr na porta 3000.
// Eles não podem correr na mesma porta ao mesmo tempo.
//
// SOLUÇÃO: Altere a porta do backend no ficheiro `server/src/app.js` para 3001:
// const PORT = process.env.PORT || 3001;
//
// Se o fizer, o URL base da sua API será http://localhost:3001
// ----------------------------------------------------

const api = axios.create({
  // Use o URL onde o seu servidor backend está a correr.
  baseURL: 'http://localhost:3001/api', 
});

export default api;
