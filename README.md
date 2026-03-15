# English Learning App 📚

A simple React PWA that helps you learn English vocabulary with audio pronunciation.

## Features

- ✏️ **Simple Input**: Enter word pairs in format `english - 中文`
- 🔊 **Text-to-Speech**: Hear pronunciation in both English and Mandarin
- 💾 **Save Cards**: Save vocabulary cards for later review
- 🔁 **Replay**: Replay audio anytime from saved cards
- 📱 **PWA**: Install on iPhone home screen for native app experience

## How to Use

1. **Enter**: Type a word pair like `apple - 苹果`
2. **Play**: Tap "Play Audio" to hear pronunciation
3. **Save**: Save the card for later review
4. **Review**: Go to "Saved" tab to replay any card

## Installation

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Install on iPhone

1. Deploy to a HTTPS server (required for PWA)
2. Open the URL in Safari on your iPhone
3. Tap the Share button (square with arrow)
4. Tap "Add to Home Screen"
5. The app will now appear as a native app icon

## Technical Details

- **React 18** with Vite for fast development
- **Web Speech API** for text-to-speech
- **LocalStorage** for saving cards offline
- **PWA** with offline support

## Browser Support

- Safari on iOS (primary target)
- Chrome on Android
- Modern desktop browsers
