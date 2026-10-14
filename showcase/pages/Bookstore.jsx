import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, Card, Badge, Drawer, Alert, Skeleton, Chip } from '../components/ui';
import BookCard from '../components/BookCard';
import { searchCatalog, createOrder, formatUSD } from '../lib/bookstoreApi';

const GENRES = ['All', 'Design', 'Engineering', 'Fiction', 'Science', 'History'];

export default function Bookstore() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('All');
  const [pageToken, setPageToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [email, setEmail] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [orderError, setOrderError] = useState('');

  const load = useCallback(async (q, token, append) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      setError('');
      const data = await searchCatalog(q, token);
      setBooks((prev) => (append ? [...prev, ...data.items] : data.items));
      setPageToken(data.next_page_token);
    } catch (e) {
      setError(e.message || 'Could not reach the catalog.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(query, null, false), 350);
    return () => clearTimeout(t);
  }, [query, load]);

  const visible = genre === 'All' ? books : books.filter((b) => b.genre_label === genre);

  const openBook = (book) => {
    setSelected(book);
    setQty(1);
    setEmail('');
    setOrderResult(null);
    setOrderError('');
  };

  const placeOrder = async () => {
    if (!selected || !email.trim()) return;
    setOrdering(true);
    setOrderError('');
    try {
      const order = await createOrder(email.trim(), [{ sku: selected.sku, quantity: qty }]);
      setOrderResult(order);
    } catch (e) {
      if (e.status === 409) {
        setOrderError(`Not enough stock — ${e.message}`);
      } else {
        setOrderError(e.message || 'Order failed. Please try again.');
      }
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <header style={{
        padding: '4.5rem 1.5rem 3.5rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--surface-raised) 0%, var(--bg) 100%)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: '0.8rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '1rem' }}>
          Est. MMXXVI · Purveyors of fine volumes
        </div>
        <h1 style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
          fontWeight: 700,
          margin: '0 0 1rem',
          lineHeight: 1.1,
        }}>
          The Bound Bookshop
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '560px', margin: '0 auto 2rem', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
          “A room without books is like a body without a soul.” — browse the live catalog, straight from our shelves.
        </p>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <Input
            placeholder="Search by title or author…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '1.25rem' }}>
          {GENRES.map((g) => (
            <Chip
              key={g}
              className={genre === g ? 'ou-chip-primary' : 'ou-chip-outline'}
              onClick={() => setGenre(g)}
              style={{ cursor: 'pointer' }}
            >
              {g}
            </Chip>
          ))}
        </div>
      </header>

      {/* ── Catalog ──────────────────────────────────────── */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem', width: '100%' }}>
        {error && <Alert variant="danger" style={{ marginBottom: '1.5rem' }}>{error}</Alert>}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} style={{ overflow: 'hidden' }}>
                <Skeleton height={260} variant="text" />
                <div style={{ padding: '1rem' }}>
                  <Skeleton width="80%" height={20} />
                  <div style={{ height: '0.5rem' }} />
                  <Skeleton width="50%" height={16} />
                </div>
              </Card>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <Card style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', marginBottom: '0.5rem' }}>No volumes found</div>
            <div style={{ color: 'var(--text-muted)' }}>Try a different title, author, or genre.</div>
          </Card>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {visible.map((b) => (
                <BookCard key={b.sku} book={b} onSelect={openBook} />
              ))}
            </div>
            {pageToken && (
              <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                <Button variant="secondary" loading={loadingMore} onClick={() => load(query, pageToken, true)}>
                  Load more from the stacks
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Book detail + order drawer ───────────────────── */}
      <Drawer isOpen={!!selected} onClose={() => setSelected(null)} title={selected ? selected.title : ''}>
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              <img
                src={selected.cover_image_url}
                alt={selected.title}
                style={{ width: '140px', aspectRatio: '3 / 4', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                  <Badge variant="primary">{selected.genre_label}</Badge>
                  <Badge variant={selected.stock_count > 3 ? 'success' : 'warning'}>
                    {selected.stock_count > 0 ? `${selected.stock_count} in stock` : 'Out of stock'}
                  </Badge>
                </div>
                <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  {selected.author_display_name} · {selected.published_year}
                </div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {formatUSD(selected.price_usd)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>SKU {selected.sku}</div>
              </div>
            </div>

            {orderResult ? (
              <Alert variant="success">
                <strong>Order {orderResult.order_id} placed!</strong>
                <div style={{ marginTop: '0.4rem' }}>
                  {orderResult.line_items.map((li) => (
                    <div key={li.sku}>{li.quantity} × {li.title} — {formatUSD(li.line_total_usd)}</div>
                  ))}
                  <div style={{ marginTop: '0.4rem', fontWeight: 700 }}>Total: {formatUSD(orderResult.total_usd)}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Confirmation sent to {orderResult.customer_email}</div>
                </div>
              </Alert>
            ) : (
              <>
                {orderError && <Alert variant="danger">{orderError}</Alert>}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'end', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Button variant="outline" size="sm" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</Button>
                    <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                    <Button variant="outline" size="sm" onClick={() => setQty((q) => Math.min(selected.stock_count, q + 1))}>+</Button>
                  </div>
                  <div style={{ flex: '1 1 180px' }}>
                    <Input label="Email for confirmation" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                <Button
                  variant="primary"
                  loading={ordering}
                  disabled={!email.trim() || selected.stock_count === 0}
                  onClick={placeOrder}
                  style={{ width: '100%' }}
                >
                  Place order · {formatUSD(selected.price_usd * qty)}
                </Button>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Live order via POST /orders — overselling returns a 409, handled gracefully above.
                </div>
              </>
            )}
          </div>
        )}
      </Drawer>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>The Bound Bookshop</span>
        {' '}· catalog & orders powered by the live Bookstore API · built with openUI
      </footer>
    </div>
  );
}