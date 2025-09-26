import React from 'react';
import { Link } from 'react-router-dom';
import './style/DocumentCard.css';

function DocumentCard({ doc }) {
  // Transforma a string de autores em links individuais
  const authorLinks = doc.authors.split(',').map((author, index, array) => (
    <span key={author.trim()}>
      <Link to={`/autores/${encodeURIComponent(author.trim())}`}>
        {author.trim()}
      </Link>
      {index < array.length - 1 ? ', ' : ''} {/* Adiciona vírgula entre os nomes */}
    </span>
  ));

  return (
    <div className="doc-card">
      <h3 className="doc-title">{doc.title}</h3>
      <p className="doc-authors">{authorLinks}</p>
      
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

