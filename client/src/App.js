import React from 'react';

// Este é o componente principal que vai conter todas as suas páginas e componentes.
// Apagamos todo o conteúdo de exemplo e deixamos um esqueleto limpo.
function App() {
  return (
    <div>
      {/* A classe "container" vem do seu style.css e ajuda a centralizar o conteúdo.
        É um bom lugar para começar a adicionar os componentes do seu layout,
        como um Header, o conteúdo principal da página e um Footer.
      */}
      <main className="container">
        <h1>Biblioteca Digital</h1>
        <p>A nossa aplicação React começa aqui!</p>
      </main>
    </div>
  );
}

export default App;
