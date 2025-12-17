# APManager Widget Backend API

Express.js backend API for the APManager Student Search Zendesk Widget.

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Configure Environment

```bash
cp .env.example .env
nano .env
```

### Start Server

```bash
# Development
npm run dev

# Production
npm start
```

## 📋 API Endpoints

### Health Check

**GET** `/health`

Returns server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-17T01:00:00.000Z",
  "apmanagerUrl": "https://apmanager.aplatam.com"
}
```

### Authentication

**POST** `/api/auth/microsoft`

Authenticate user with Microsoft credentials.

**Request:**
```json
{
  "email": "user@company.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "email": "user@company.com"
  }
}
```

### Search Student

**POST** `/api/search`

Search for student in database and APManager.

**Request:**
```json
{
  "searchTerm": "student@email.com",
  "email": "user@company.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "student": {
    "lead_id": "123456",
    "nombre": "John Doe",
    "email": "student@email.com",
    "telefono": "+593987654321",
    "programa": "MAESTRIA",
    "matricula": "M12345",
    "estado": "activo"
  },
  "source": "database"
}
```

### Apply Tipificacion

**POST** `/api/tipificacion`

Apply automatic tipificacion in APManager.

**Request:**
```json
{
  "leadId": "123456",
  "ticketId": "12345",
  "email": "user@company.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tipification applied successfully",
  "leadId": "123456",
  "ticketId": "12345"
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `APMANAGER_BASE_URL` | APManager URL | `https://apmanager.aplatam.com` |
| `DB_PATH` | SQLite database path | `../estudiantes.db` |
| `NODE_ENV` | Environment | `development` |
| `LOG_LEVEL` | Logging level | `info` |

## 🧪 Testing

### Test Health Endpoint

```bash
curl http://localhost:3000/health
```

### Test Auth Endpoint

```bash
curl -X POST http://localhost:3000/api/auth/microsoft \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@company.com",
    "password": "password"
  }'
```

### Test Search Endpoint

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "searchTerm": "student@email.com",
    "email": "user@company.com",
    "password": "password"
  }'
```

## 📊 Performance

| Operation | Expected Time |
|-----------|--------------|
| DB Query | < 5ms |
| Authentication | ~45s |
| Search (Database) | < 5ms |
| Search (APManager) | ~77s |
| Tipificacion | ~45s |

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Not Found

```bash
# Check database path
ls -lh ../estudiantes.db

# Update DB_PATH in .env
DB_PATH=/full/path/to/estudiantes.db
```

### Playwright Installation

```bash
# Install browsers
npx playwright install chromium
```

## 📚 Documentation

- [Full Documentation](../zendesk-widget/README.md)
- [Deployment Guide](../DEPLOYMENT.md)
- [Architecture](../ARCHITECTURE.md)

---

**Version:** 1.0.0  
**Author:** Ian - UDLA Tech
