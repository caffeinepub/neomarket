# NeoDate – Futuristic Dating App

## Current State
Fresh project. No existing code.

## Requested Changes (Diff)

### Add
- Authentication: signup/login with password hashing (SHA-256 simulation), session management, admin login
- Profile system: name, age, gender, location, lifestyle, hobbies, interests, bio, profile image upload (blob storage)
- Swipe system: Tinder-style swipe right/left, match detection with animation, touch + mouse support
- Smart matching: compatibility score based on hobbies/lifestyle/age range, sorted suggestion queue
- Chat: persisted messages in backend, auto-refresh polling (simulated real-time), typing indicator UI, emoji support, online/offline status
- Connection requests: send/accept/reject, notification bell with unread counter
- Stories: uploadable image stories (blob storage), story viewer UI
- Admin dashboard: view all users, ban/unban, view match stats
- Extra: dark/light toggle, online user counter, profile verification badge, like counter, report/block UI, floating action buttons, custom cursor glow, sound toggle, scroll progress indicator

### Modify
- Nothing (new project)

### Remove
- Nothing

## Implementation Plan
1. Backend (Motoko): User store (profiles, hashed passwords, sessions), swipe/match store, chat message store, connection request store, story store, admin functions, compatibility scoring
2. Blob storage component for profile images and stories
3. Authorization component for session/role management
4. Frontend: Auth pages (login/signup), discover/swipe page, matches page, chat page, profile editor, admin dashboard, notifications
5. Design: #0a0a0a bg, neon pink/purple/cyan gradients, glassmorphism cards, GPU-only animations
