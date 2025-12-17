# Translation System (i18n) - APManager Widget

Complete guide to the internationalization system for the APManager Student Search Zendesk Widget.

## 📖 Overview

The widget uses Zendesk's built-in i18n framework for translations, supporting:

- Multiple languages (Spanish and English included)
- Dynamic text replacement with `{{t "key"}}` syntax
- Parameter interpolation: `{{t "key" param="value"}}`
- Easy extension to new languages
- Zero hardcoded strings

## 🌍 Supported Languages

Currently supported:
- **Spanish (es)** - Default
- **English (en)**

Easy to add:
- Portuguese (pt)
- French (fr)
- German (de)
- Any language!

## 📁 File Structure

```
zendesk-widget/
└── translations/
    ├── es.json      # Spanish translations
    ├── en.json      # English translations
    └── pt.json      # Portuguese (optional)
```

## 🔧 How It Works

### In HTML

Use Zendesk's `{{t "key"}}` helper:

```html
<h1>{{t "app.name"}}</h1>
<p>{{t "auth.modal_description"}}</p>
<button>{{t "auth.login_button"}}</button>
```

### In JavaScript

Use the `t()` function:

```javascript
// Simple translation
const title = t('app.name');

// With parameter interpolation
const message = t('errors.message', { term: 'john@email.com' });

// Result: "No se encontraron resultados para: john@email.com"
```

### Translation Function

```javascript
function t(key, params = {}) {
  try {
    let text = state.client.get(`i18n.${key}`);
    
    // Simple interpolation
    Object.keys(params).forEach(param => {
      text = text.replace(`{{${param}}}`, params[param]);
    });
    
    return text;
  } catch (error) {
    return key;
  }
}
```

## 📝 Translation File Format

### Structure

```json
{
  "category": {
    "key": "Value",
    "key_with_param": "Value with {{param}}"
  }
}
```

### Complete Example (es.json)

```json
{
  "app": {
    "name": "Búsqueda de Estudiantes APManager"
  },
  "auth": {
    "modal_title": "Autenticación Microsoft",
    "email_label": "Email Corporativo",
    "login_button": "Iniciar Sesión con Microsoft"
  },
  "results": {
    "student_id": "ID: {{id}}",
    "email_label": "Email:"
  },
  "errors": {
    "message": "No se encontraron resultados para: {{term}}"
  }
}
```

## 🎯 Translation Keys Reference

### Category: `app`

| Key | Description | Example |
|-----|-------------|---------|
| `app.name` | Application name | "APManager Student Search" |

### Category: `auth`

| Key | Description | Params |
|-----|-------------|--------|
| `auth.modal_title` | Modal header | None |
| `auth.modal_description` | Modal description | None |
| `auth.email_label` | Email field label | None |
| `auth.email_placeholder` | Email placeholder | None |
| `auth.password_label` | Password field label | None |
| `auth.password_placeholder` | Password placeholder | None |
| `auth.login_button` | Login button text | None |
| `auth.logging_in` | Loading state text | None |
| `auth.logout_button` | Logout button text | None |

### Category: `search`

| Key | Description | Params |
|-----|-------------|--------|
| `search.header_title` | Page header | None |
| `search.status_searching` | Initial search state | None |
| `search.status_searching_term` | Searching with term | `term` |
| `search.no_data` | No data in ticket | None |

### Category: `results`

| Key | Description | Params |
|-----|-------------|--------|
| `results.student_id` | Student ID label | `id` |
| `results.email_label` | Email label | None |
| `results.phone_label` | Phone label | None |
| `results.program_label` | Program label | None |
| `results.registration_label` | Registration label | None |
| `results.status_label` | Status label | None |
| `results.view_apmanager` | Link button text | None |
| `results.apply_tipificacion` | Tipification button | None |
| `results.applying` | Applying state | None |
| `results.completed` | Completed state | None |
| `results.no_name` | Fallback name | None |
| `results.no_data` | Fallback value | None |

### Category: `errors`

| Key | Description | Params |
|-----|-------------|--------|
| `errors.title` | Error header | None |
| `errors.message` | Error message | `term` |
| `errors.retry_button` | Retry button text | None |
| `errors.auth_required` | Auth validation | None |
| `errors.invalid_email` | Email validation | None |
| `errors.invalid_credentials` | Login error | None |
| `errors.search_error` | Search error | None |
| `errors.tipificacion_error` | Tipification error | None |
| `errors.init_error` | Init error | None |

### Category: `notifications`

| Key | Description | Params |
|-----|-------------|--------|
| `notifications.tipificacion_success` | Success message | None |
| `notifications.tipificacion_error` | Error message | None |
| `notifications.no_student_data` | No data warning | None |

## ➕ Adding a New Language

### Step 1: Create Translation File

```bash
cd zendesk-widget/translations
cp es.json pt.json  # Portuguese example
```

### Step 2: Translate Content

Edit `pt.json`:
```json
{
  "app": {
    "name": "Busca de Estudantes APManager"
  },
  "auth": {
    "modal_title": "Autenticação Microsoft",
    "login_button": "Entrar com Microsoft"
  }
  // ... translate all keys
}
```

### Step 3: Update Manifest

Edit `manifest.json`:
```json
{
  "defaultLocale": "es",
  "locales": ["es", "en", "pt"]
}
```

### Step 4: Rebuild Widget

```bash
./build-widget-zip.sh
```

### Step 5: Re-upload to Zendesk

Upload the new ZIP file.

## 🔍 Best Practices

### 1. Keep Keys Organized

Group related translations:
```json
{
  "auth": { /* auth-related keys */ },
  "search": { /* search-related keys */ },
  "results": { /* results-related keys */ }
}
```

### 2. Use Descriptive Keys

```json
// ❌ Bad
"text1": "Hello"
"btn": "Click me"

// ✅ Good
"greeting.welcome": "Hello"
"actions.submit_button": "Click me"
```

### 3. Consistent Naming

- Use snake_case: `modal_title`
- Use prefixes: `button_`, `label_`, `error_`
- Be specific: `email_label` not just `label`

### 4. Parameter Naming

Use clear parameter names:
```json
// ✅ Good
"message": "Hello {{userName}}, you have {{count}} messages"

// ❌ Bad
"message": "Hello {{x}}, you have {{y}} messages"
```

### 5. Fallback Values

Always provide fallback:
```javascript
function t(key, params = {}) {
  try {
    return translate(key, params);
  } catch (error) {
    return key; // Return key as fallback
  }
}
```

### 6. No Hardcoded Strings

```javascript
// ❌ Bad
document.querySelector('.title').textContent = 'Student Search';

// ✅ Good
document.querySelector('.title').textContent = t('search.header_title');
```

## 🧪 Testing Translations

### Test All Languages

```javascript
// In browser console
const languages = ['es', 'en', 'pt'];

languages.forEach(lang => {
  console.log(`Testing ${lang}...`);
  // Switch language and check translations
});
```

### Verify Parameters

```javascript
// Test parameter interpolation
const tests = [
  { key: 'results.student_id', params: { id: '12345' } },
  { key: 'errors.message', params: { term: 'test@email.com' } }
];

tests.forEach(test => {
  const result = t(test.key, test.params);
  console.log(`${test.key}: ${result}`);
});
```

### Check Missing Keys

```javascript
// List all keys
const allKeys = [
  'app.name',
  'auth.modal_title',
  // ... all keys
];

allKeys.forEach(key => {
  const value = t(key);
  if (value === key) {
    console.warn(`Missing translation: ${key}`);
  }
});
```

## 🐛 Troubleshooting

### Translations not showing

**Check:**
1. File syntax is valid JSON
2. Keys match exactly (case-sensitive)
3. Widget rebuilt after changes
4. Correct locale selected in Zendesk

**Fix:**
```bash
# Validate JSON
cat translations/es.json | jq .

# Rebuild widget
./build-widget-zip.sh
```

### Parameters not replaced

**Check:**
1. Parameter names match
2. Using double curly braces: `{{param}}`
3. Passing params object to `t()`

**Example:**
```javascript
// ❌ Wrong
t('errors.message');

// ✅ Correct
t('errors.message', { term: 'john@email.com' });
```

### Wrong language displayed

**Check:**
1. User locale in Zendesk
2. defaultLocale in manifest
3. Translation file exists

**Debug:**
```javascript
// Check current locale
const locale = await state.client.get('currentUser.locale');
console.log('Current locale:', locale);
```

## 📚 Resources

- [Zendesk i18n Documentation](https://developer.zendesk.com/documentation/apps/app-developer-guide/using-the-apps-framework/#using-app-translations)
- [JSON Validator](https://jsonlint.com/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

## ✨ Tips

### Use Translation Tool

Create a helper script:
```bash
#!/bin/bash
# translate-check.sh
for file in translations/*.json; do
  echo "Checking $file..."
  jq empty "$file" && echo "✅ Valid" || echo "❌ Invalid"
done
```

### Export/Import Translations

```javascript
// Export for translation service
const translations = require('./translations/es.json');
const keys = extractAllKeys(translations);
exportToCSV(keys);

// Import translated CSV
importFromCSV('translations.csv', 'pt.json');
```

---

**Last Updated:** December 2024  
**Version:** 2.0.0  
**Status:** ✅ Complete
