# Leads Export API

Endpoint to retrieve full lead submissions with filtering for admin users.

## Authentication
- Requires admin JWT (Bearer) obtained via existing `/auth/login` / `/auth/refresh`.

## URL
- `GET /forms/submissions/export`

## Query Parameters (all optional)
- `slug` (string): Filter by form slug (e.g., `contact`, `partner`, `sponsor`, `brand-guidelines`, `feedback`).
- `q` (string): Case-insensitive search across field labels/values (name, email, etc.).
- `from` (ISO date string): Include submissions on/after this date.
- `to` (ISO date string): Include submissions on/before this date.
- `order` (`asc` | `desc`): Sort by created time. Default: `desc`.
- `limit` (number): Max records to return. Default: 1000, maximum: 5000.

## Response
`200 OK`
```json
{
  "data": [
    {
      "id": "65f1…",
      "slug": "contact",
      "createdAt": "2024-05-01T10:15:00.000Z",
      "data": [
        { "id": "name", "label": "Name", "value": "Jane Doe" },
        { "id": "email", "label": "Email", "value": "jane@example.com" },
        { "id": "message", "label": "Project details", "value": "…" }
      ]
    }
  ],
  "filters": {
    "slug": "contact",
    "q": "jane",
    "from": "2024-05-01",
    "to": "2024-05-10",
    "order": "desc",
    "limit": 1000
  }
}
```

## Error Codes
- `401 Unauthorized`: Missing/invalid token.
- `400 Bad Request`: Invalid query (e.g., malformed date).
- `500 Internal Server Error`: Server-side failure.

## Notes
- Use for bulk/filtered exports (e.g., CSV). For paginated UI, use `GET /forms/submissions`.
- Results are capped at 5,000 per call to protect the service.
