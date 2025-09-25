import React from 'react';
import { Link } from 'react-router-dom'; // Importar o Link
import './style/DocumentCard.css';

function DocumentCard({ doc }) {
  return (
    <div className="doc-card">
      <h3 className="doc-title">{doc.title}</h3>
      <p className="doc-authors">{doc.authors}</p>
      
      {/* O nome da publicação agora é um link */}
      <p className="doc-publication">
        Publicado em: 
        <Link to={`/eventos/${doc.eventSlug}`}> {doc.publication}, {doc.year}</Link>
      </p>

      <a href={doc.url} className="doc-link" target="_blank" rel="noopener noreferrer">
        Aceder ao Artigo
      </a>
    </div>
  );
}

export default DocumentCard;

