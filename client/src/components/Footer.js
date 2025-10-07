import React, { useState } from 'react';
import './style/Footer.css'; // Importando o CSS

function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() === '') {
      alert('Por favor, insira um email válido.');
      return;
    }
    
    // ATENÇÃO: Lógica de INSCRIÇÃO. O próximo passo é conectar com a API (POST /api/usuarios/subscribe).
    setMessage('Obrigado por se inscrever! Você receberá as novidades.');
    setEmail('');

    // Limpa a mensagem após 5 segundos
    setTimeout(() => {
      setMessage('');
    }, 5000);
  };

  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="subscription-section">
          <h4>Receba Notificações</h4>
          <p>Cadastre-se para receber um email sempre que um novo artigo for disponibilizado.</p>
          <form onSubmit={handleSubmit} className="subscription-form">
            <input
              type="email"
              placeholder="Seu melhor email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary">Inscrever-se</button>
          </form>
          {message && <p className="success-message">{message}</p>}
        </div>
        <p className="footer-credits">&copy; 2024 Biblioteca Digital SBC. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;

