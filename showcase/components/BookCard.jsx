import React from 'react';
import { Card, Badge, Button } from './ui';
import { formatUSD } from '../lib/bookstoreApi';

export default function BookCard({ book, onSelect }) {
  const low = book.stock_count <= 3;
  return (
    <Card
      className="ou-card-hover"
      style={{
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
      onClick={() => onSelect(book)}
    >
      <div style={{ position: 'relative', aspectRatio: '3 / 4', overflow: 'hidden', background: 'var(--surface-raised)' }}>
        <img
          src={book.cover_image_url}
          alt={book.title}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.5rem' }}>
          <Badge variant="primary">{book.genre_label}</Badge>
        </div>
        {low && (
          <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
            <Badge variant="warning">Only {book.stock_count} left</Badge>
          </div>
        )}
      </div>
      <div style={{ padding: '1.1rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: '1.12rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
          {book.title}
        </div>
        <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          {book.author_display_name} · {book.published_year}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', fontFamily: "Georgia, serif" }}>
            {formatUSD(book.price_usd)}
          </span>
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onSelect(book); }}>
            View →
          </Button>
        </div>
      </div>
    </Card>
  );
}