import React, { useState } from 'react';
import './style/BibtexImportPage.css';

function BibtexImportPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.bib')) {
      setSelectedFile(file);
      setMessage(`Ficheiro selecionado: ${file.name}`);
      setIsError(false);
    } else {
      setSelectedFile(null);
      setMessage('Por favor, selecione um ficheiro .bib válido.');
      setIsError(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage('Nenhum ficheiro selecionado.');
      setIsError(true);
      return;
    }

    // ATENÇÃO: Lógica de UPLOAD (POST /api/artigos/importar-bibtex)
    // Aqui você usaria FormData para enviar o 'selectedFile' para o backend.
    
    // Simulação de sucesso
    console.log('Enviando ficheiro:', selectedFile.name);
    setMessage('Importação concluída com sucesso! 15 artigos foram adicionados.');
    setIsError(false);
    setSelectedFile(null); // Limpa o input
    
    // Simulação de erro (para testar)
    // setMessage('Ocorreu um erro ao processar o ficheiro. Verifique o formato.');
    // setIsError(true);
  };

  return (
    <main className="container">
      <div className="import-page">
        <h1>Importação em Massa via BibTeX</h1>
        <p>Faça o upload de um ficheiro <code>.bib</code> para cadastrar múltiplos artigos de uma só vez.</p>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="bibtex-file">Selecionar Ficheiro .bib</label>
            <input 
              type="file" 
              id="bibtex-file" 
              accept=".bib" 
              onChange={handleFileChange} 
            />
          </div>

          <button type="submit" className="btn-primary" disabled={!selectedFile}>
            Importar Artigos
          </button>
        </form>

        {message && (
          <div className={`feedback-message ${isError ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}

export default BibtexImportPage;
