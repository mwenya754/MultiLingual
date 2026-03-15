# MultiLingual

A browser-based multilingual translation web application built with HTML, CSS, and JavaScript.

## Features

- Translate text between 10+ languages using the [MyMemory Translation API](https://mymemory.translated.net/)
- Auto-detect source language
- Switch source and target languages with one click
- Real-time translation with debounce (600 ms after typing stops)
- 500-character input limit with live counter
- Text-to-Speech for both source and translated text
- Copy-to-clipboard for both panels
- Loading indicator and error handling
- Dark mode (respects system preference; toggleable)
- Responsive design for mobile and desktop

## Setup Instructions

No build step or server required. The application runs entirely in the browser.

1. **Clone or download** the repository:
   ```bash
   git clone https://github.com/mwenya754/MultiLingual.git
   cd MultiLingual
   ```

2. **Open** `index.html` directly in any modern web browser:
   - Double-click `index.html` in your file explorer, **or**
   - Serve with a simple local server (optional, avoids browser CORS restrictions on `file://`):
     ```bash
     # Python 3
     python -m http.server 8080
     # then open http://localhost:8080
     ```

3. The page will automatically translate **"Hello, how are you"** from English to French on load.

## Usage

| Action | How |
|---|---|
| Translate | Type in the left panel and click **Translate**, or wait 600 ms after typing |
| Change languages | Use the dropdowns in the language bar |
| Swap languages | Click the ⇆ button between the dropdowns |
| Listen | Click the 🔊 icon in either panel |
| Copy | Click the 📋 icon in either panel |
| Dark mode | Click the 🌙/☀ icon in the header |

## Tech Stack

- **HTML5** – semantic markup, ARIA accessibility attributes
- **CSS3** – CSS custom properties (theming), CSS Grid, responsive layout
- **Vanilla JavaScript (ES2017+)** – Fetch API, Web Speech API, Clipboard API
- **API** – [MyMemory Translation API](https://api.mymemory.translated.net/get) (free, no key required)
- **Icons** – [Font Awesome 6](https://fontawesome.com/) (CDN)
