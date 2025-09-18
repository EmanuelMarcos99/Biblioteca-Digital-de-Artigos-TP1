import React from 'react';

// Componente para um card de documento individual
function DocumentCard({ doc }) {
  return (
    <div className="document-card">
      <h3><a href={doc.url}>{doc.title}</a></h3>
      <p className="authors">{doc.authors}</p>
      <p className="publication">{doc.publication}, {doc.year}</p>
      <a href={doc.url} className="btn-pdf" target="_blank" rel="noopener noreferrer">
        Ver PDF
      </a>
    </div>
  );
}

export default DocumentCard;
