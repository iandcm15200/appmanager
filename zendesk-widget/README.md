# APManager Student Search - Zendesk Widget

Professional Zendesk widget for automatic student search in APManager with Microsoft authentication, animations, and i18n support.

## 📋 Features

- **Microsoft Authentication** - Secure login with corporate credentials
- **Automatic Search** - Extracts ticket data and searches automatically
- **Two-Tier Search** - Fast local database (< 100ms) then APManager (60-80s)
- **Smart Phone Matching** - Multiple phone format variations
- **One-Click Tipification** - Pre-configured automatic tipification
- **Smooth Animations** - Professional UI with Anime.js
- **Bilingual Support** - Spanish and English (extensible)
- **Clean Code** - SOLID principles and best practices

## 🚀 Quick Start

### 1. Install Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

### 2. Build Widget ZIP

```bash
./build-widget-zip.sh
```

This creates `apmanager-student-search.zip` ready for Zendesk upload.

### 3. Upload to Zendesk

1. Go to Zendesk Admin → Apps → Manage
2. Click "Upload private app"
3. Select `apmanager-student-search.zip`
4. Configure API URL (your backend URL)
5. Enable the app

## 📦 Structure

```
zendesk-widget/
├── manifest.json           # Widget configuration
├── assets/
│   ├── index.html         # Widget UI
│   ├── main.js            # Application logic
│   ├── main.css           # Styles
│   └── anime.min.js       # Animation library
└── translations/
    ├── es.json            # Spanish translations
    └── en.json            # English translations
```

## 🔧 Configuration

### Widget Settings

Configure in Zendesk Admin → Apps → Your App → Settings:

- **api_url**: Backend API URL (e.g., `https://api.yourdomain.com`)

### Backend Environment

Edit `backend/.env`:

```env
PORT=3000
APMANAGER_BASE_URL=https://apmanager.aplatam.com
DB_PATH=../estudiantes.db
LOG_LEVEL=info
```

## 🎨 Design System

### Colors

- Primary: `#0078d4` (Microsoft Blue)
- Success: `#10b981`
- Error: `#dc2626`
- Warning: `#f59e0b`

### Typography

Font: System UI stack (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, etc.)

### Animations

- Modal entrance: Elastic scale + fade
- Loading: Continuous rotation
- Results: Slide up + fade
- Buttons: Scale on hover

## 🔌 API Endpoints

### POST /api/auth/microsoft

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
  "user": {
    "email": "user@company.com"
  }
}
```

### POST /api/search

Search student in database and APManager.

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

### POST /api/tipificacion

Apply automatic tipification.

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
  "leadId": "123456"
}
```

## 🌍 Translations

Add new languages by creating `translations/{locale}.json`:

```json
{
  "app": {
    "name": "Your App Name"
  },
  "auth": {
    "modal_title": "Your Title"
  }
  // ... more keys
}
```

Update `manifest.json`:

```json
{
  "defaultLocale": "es",
  "locales": ["es", "en", "pt"]
}
```

## 🧪 Testing

### Test Backend Locally

```bash
cd backend
npm start

# Test auth endpoint
curl -X POST http://localhost:3000/api/auth/microsoft \
  -H "Content-Type: application/json" \
  -d '{"email":"user@company.com","password":"pass"}'
```

### Test Widget Locally

1. Install Zendesk App Tools:
   ```bash
   npm install -g @zendesk/zcli
   ```

2. Run local server:
   ```bash
   cd zendesk-widget
   zcli apps:server
   ```

3. Append `?zcli_apps=true` to any Zendesk URL

## 🔒 Security

- Credentials stored in localStorage (Base64 encoded)
- HTTPS required for production
- No credentials in logs
- Session timeout recommended
- CORS configured in backend

## 📊 Performance

- Database search: < 100ms
- APManager search: 60-80s
- Widget load: < 2s
- Animations: 60fps

## 🐛 Troubleshooting

### Widget doesn't load

1. Check backend is running
2. Verify API URL in settings
3. Check browser console for errors

### Authentication fails

1. Verify credentials are correct
2. Check backend logs
3. Ensure APManager is accessible

### Search returns no results

1. Check if email/phone is in ticket
2. Verify database has data
3. Check backend search logs

### Tipification fails

1. Ensure student has lead_id
2. Check APManager permissions
3. Verify tipification selectors

## 📚 Additional Documentation

- [Quick Start Guide](../QUICKSTART.md)
- [Translation System](../TRANSLATIONS.md)
- [Deployment Guide](../DEPLOYMENT.md)
- [Architecture](../ARCHITECTURE.md)

## 🤝 Contributing

1. Follow clean code principles
2. Maintain SOLID design
3. Add tests for new features
4. Update documentation
5. Use semantic versioning

## 📄 License

ISC License - Copyright (c) 2024 Ian - UDLA Tech

## 📞 Support

For issues or questions:
- Email: ian@udla.edu.ec
- Repository: [GitHub Issues](https://github.com/iandcm15200/appmanager/issues)

---

**Version:** 2.0.0  
**Last Updated:** December 2024  
**Status:** ✅ Production Ready
