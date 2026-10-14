# The Bound Bookshop — openUI showcase

A dark-academia bookstore storefront generated through openUI's **real agent
pipeline** (prompt → MCP schema context → AI proxy → response parsing →
file output) against the **live** Benchmark Bookstore API
(`http://127.0.0.1:8471`, OpenAPI at `/openapi.json`).

## What's here

- `pages/Bookstore.jsx` — the storefront page: hero, live search
  (`GET /catalog/search` with cursor `page_token` pagination), genre filter
  chips, responsive book grid, book detail `Drawer` with quantity stepper and
  order form, order confirmation, graceful 409 oversell handling.
- `components/BookCard.jsx` — book card (cover, title, `author_display_name`,
  `genre_label` badge, `price_usd`, low-stock badge).
- `lib/bookstoreApi.js` — data layer using the **real** endpoints and field
  names: `/catalog/search`, `/catalog/items/{sku}`, `/orders`
  (`X-Api-Key` header — not Bearer), `/orders/{order_id}`,
  `/orders/{order_id}/cancel`. Handles `409 INSUFFICIENT_STOCK`.
- `preview.html` — static render proof: generated `BookCard`s with **real**
  API data, styled with the **real** kit stylesheet.

## How it was made (honest labeling)

The generation pipeline is 100% real openUI code. The LLM itself was a
**stub** (no API key on this machine): it served hand-written, hand-verified
code so the plumbing — MCP discovery, schema-context injection, the `/api/ai`
proxy, `parseAgentResponse`, file writing — could be tested end to end.
With a real key, the same prompt goes to Claude/GPT/Gemini instead.

## Verification (all against the live backend)

- 18/18 endpoint/field checks: real endpoints & fields used, hallucinated
  ones (`/api/books`, `price`, `author`) absent.
- 13/13 data-layer tests: search, cursor pagination, get item, create order,
  409 oversell, cancel, stock restore.
- 7/7 render tests: generated `BookCard` renders real data with real kit
  components (`ou-card`, `ou-badge`).
- `parseAgentResponse`: zero structural warnings on the generated files.
