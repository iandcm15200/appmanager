# Quick Start Guide - APManager Student Search Widget

Get up and running with the APManager Student Search Zendesk Widget in 15 minutes.

## ⚡ Prerequisites

- Node.js 18+ installed
- Zendesk account with admin access
- APManager account with Microsoft credentials
- SQLite database with student data

## 🚀 Step 1: Setup Backend (5 minutes)

### Install Dependencies

```bash
cd backend
npm install
```

### Configure Environment

```bash
cp .env.example .env
nano .env
```

Edit `.env`:
```env
PORT=3000
APMANAGER_BASE_URL=https://apmanager.aplatam.com
DB_PATH=../estudiantes.db
NODE_ENV=production
```

### Start Backend

```bash
npm start
```

You should see:
```
APManager Widget Backend running on port 3000
APManager URL: https://apmanager.aplatam.com
Environment: production
```

### Test Backend

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-12-17T01:00:00.000Z",
  "apmanagerUrl": "https://apmanager.aplatam.com"
}
```

## 📦 Step 2: Build Widget (2 minutes)

### Build ZIP Package

```bash
cd /path/to/appmanager
./build-widget-zip.sh
```

You should see:
```
✅ Widget ZIP created successfully!
📦 File: apmanager-student-search.zip
📏 Size: 15K
```

### Verify Structure

```bash
unzip -l apmanager-student-search.zip
```

Expected structure:
```
manifest.json
assets/index.html
assets/main.js
assets/main.css
assets/anime.min.js
translations/es.json
translations/en.json
```

## 🎯 Step 3: Deploy to Zendesk (5 minutes)

### Upload Widget

1. Go to Zendesk Admin Center
2. Navigate to: **Apps and integrations** → **Zendesk Support apps** → **Manage**
3. Click **Upload private app**
4. Select `apmanager-student-search.zip`
5. Click **Upload**

### Configure Settings

1. After upload, click **Install**
2. Configure settings:
   - **API URL**: `http://your-backend-url:3000` (or your production URL)
3. Click **Install**

### Enable Widget

1. Go to **Installed Apps**
2. Find "APManager Student Search"
3. Enable for:
   - ✅ Ticket sidebar
   - ✅ New ticket sidebar

## ✅ Step 4: Test Widget (3 minutes)

### Test Authentication

1. Open any ticket in Zendesk
2. Look for the widget in the right sidebar
3. Enter your Microsoft credentials:
   - Email: `your.email@aplatam.com`
   - Password: `your-password`
4. Click "Iniciar Sesión con Microsoft"

Expected: Modal closes, main content appears

### Test Search

1. Create a test ticket with:
   - Requester email: `known-student@email.com`
   - Or phone: `+593987654321`
2. Widget should automatically:
   - Extract email/phone
   - Show search status
   - Display student results

### Test Tipification

1. With results displayed
2. Click "Aplicar Tipificación"
3. Wait for confirmation

Expected: Success notification from Zendesk

## 🔧 Troubleshooting

### Widget doesn't appear

**Check:**
- Widget is installed and enabled
- You're viewing a ticket (not just ticket list)
- Browser console for errors (F12)

**Fix:**
```bash
# Rebuild and re-upload
./build-widget-zip.sh
# Upload again to Zendesk
```

### Authentication fails

**Check:**
- Backend is running: `curl http://localhost:3000/health`
- API URL is correct in Zendesk settings
- Credentials are valid for APManager

**Fix:**
```bash
# Check backend logs
cd backend
npm start
# Look for [Auth] messages
```

### Search doesn't work

**Check:**
- Ticket has email or phone
- Database exists: `ls -lh estudiantes.db`
- Backend can access database

**Fix:**
```bash
# Test database
sqlite3 estudiantes.db "SELECT COUNT(*) FROM estudiantes;"
# Should return number > 0
```

### No results found

**Check:**
- Email/phone exists in database or APManager
- Backend credentials are correct
- APManager is accessible

**Fix:**
```bash
# Test search endpoint
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "searchTerm": "test@email.com",
    "email": "your@email.com",
    "password": "yourpass"
  }'
```

## 🎓 Next Steps

Now that everything is working:

1. **Add more students** - Import Excel files to database
2. **Customize translations** - Edit `translations/*.json`
3. **Adjust styling** - Modify `assets/main.css`
4. **Configure tipification** - Edit `backend/routes/tipificacion.js`
5. **Setup production** - Deploy backend to cloud service

## 📚 Learn More

- [Full Documentation](zendesk-widget/README.md)
- [Translation System](TRANSLATIONS.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Architecture Details](ARCHITECTURE.md)

## 💡 Tips

### Development Mode

Use `nodemon` for auto-reload:
```bash
cd backend
npm install -g nodemon
nodemon server.js
```

### Debug Mode

Enable detailed logging:
```bash
cd backend
LOG_LEVEL=debug npm start
```

### Test with Sample Data

Add test student to database:
```sql
sqlite3 estudiantes.db
INSERT INTO estudiantes VALUES (
  'TEST123', 'MAESTRIA', 'test@email.com', 
  '+593987654321', 'Test Student', 'M001', 
  'activo', 'manual', CURRENT_TIMESTAMP
);
```

### Performance Monitoring

Watch backend performance:
```bash
# In separate terminal
watch -n 1 'curl -s http://localhost:3000/health | jq'
```

## ✨ Success Checklist

- [ ] Backend running on port 3000
- [ ] Health endpoint responds OK
- [ ] Widget ZIP built successfully
- [ ] Widget uploaded to Zendesk
- [ ] API URL configured correctly
- [ ] Widget appears in ticket sidebar
- [ ] Authentication works
- [ ] Search finds students
- [ ] Tipification applies successfully
- [ ] Animations are smooth
- [ ] Translations display correctly

## 🎉 You're Done!

Your APManager Student Search widget is now live and ready to use!

**Need help?** Check the troubleshooting section or contact support.

---

**Time to complete:** 15 minutes  
**Difficulty:** Easy  
**Last updated:** December 2024
