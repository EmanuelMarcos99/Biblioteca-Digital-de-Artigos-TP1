import React from 'react';
import { Link } from 'react-router-dom';
import './style/DocumentCard.css';

// Componente auxiliar para destacar o texto
const Highlighted = ({ text = '', highlight = '' }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
      )}
    </span>
  );
};

function DocumentCard({ doc, searchTerm }) {
  const authorLinks = doc.authors.split(',').map((author, index, array) => (
    <span key={author.trim()}>
      <Link to={`/authors/${encodeURIComponent(author.trim())}`}>
        <Highlighted text={author.trim()} highlight={searchTerm} />
      </Link>
      {index < array.length - 1 ? ', ' : ''}
    </span>
  ));

  return (
    <div className="doc-card">
      <h3 className="doc-title">
        <Highlighted text={doc.title} highlight={searchTerm} />
      </h3>
      <p className="doc-authors">{authorLinks}</p>
      
      {/* --- CORREÇÃO FINAL: Renderizar esta secção apenas se houver dados de publicação --- */}
      {doc.publication && doc.year && (
        <p className="doc-publication">
          Publicado em: 
          <Link to={`/events/slug/${doc.eventSlug}`}>
              <Highlighted text={doc.publication} highlight={searchTerm} />, {doc.year}
          </Link>
        </p>
      )}

      <a href={doc.pdf_url} className="doc-link" target="_blank" rel="noopener noreferrer">
        Aceder ao Artigo
      </a>
    </div>
  );
}

export default DocumentCard;

