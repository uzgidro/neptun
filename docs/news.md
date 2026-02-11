# News API

## Endpoint

```
GET /news?page={page}
```

## Authorization

Bearer token required.

```
Authorization: Bearer <token>
```

## Query Parameters

| Parameter | Type    | Required | Default | Description |
|-----------|---------|----------|---------|-------------|
| `page`    | integer | No       | 1       | Page number |

## Response

### Success (200 OK)

```json
{
  "items": [
    {
      "id": 9673,
      "uz": "Sarlavha UZ",
      "uztext": "<html>To'liq matn UZ</html>",
      "uzsmall": "Qisqa matn UZ",
      "ru": "Заголовок RU",
      "rutext": "<html>Полный текст RU</html>",
      "rusmall": "Краткий текст RU",
      "eng": "Title EN",
      "engtext": "<html>Full text EN</html>",
      "engsmall": "Summary EN",
      "date": "2026-02-06 11:49:33",
      "img": "https://example.com/uploads/news/image.jpg",
      "views": 840
    }
  ],
  "_meta": {
    "totalCount": 9586,
    "pageCount": 480,
    "currentPage": 1,
    "perPage": 20
  },
  "_links": {
    "self": { "href": "https://example.com/api/news?page=1" },
    "next": { "href": "https://example.com/api/news?page=2" },
    "last": { "href": "https://example.com/api/news?page=480" }
  }
}
```

### Item Fields

| Field      | Type   | Description                              |
|------------|--------|------------------------------------------|
| `id`       | int    | News ID                                  |
| `uz`       | string | Title in Uzbek                           |
| `ru`       | string | Title in Russian                         |
| `eng`      | string | Title in English                         |
| `uztext`   | string | Full text in Uzbek (HTML)                |
| `rutext`   | string | Full text in Russian (HTML)              |
| `engtext`  | string | Full text in English (HTML)              |
| `uzsmall`  | string | Summary in Uzbek                         |
| `rusmall`  | string | Summary in Russian                       |
| `engsmall` | string | Summary in English                       |
| `date`     | string | Publication date (`YYYY-MM-DD HH:mm:ss`) |
| `img`      | string | Image URL                                |
| `views`    | int    | View count                               |

### Pagination (`_meta`)

| Field         | Type | Description           |
|---------------|------|-----------------------|
| `totalCount`  | int  | Total number of news  |
| `pageCount`   | int  | Total number of pages |
| `currentPage` | int  | Current page number   |
| `perPage`     | int  | Items per page (20)   |

## Examples

### Request: First page (default)

```
GET /news
```

### Request: Specific page

```
GET /news?page=2
```

## Error Codes

| Code | Description                             |
|------|-----------------------------------------|
| 401  | Unauthorized — invalid or missing token |
| 502  | Bad Gateway — example.com is unavailable |
