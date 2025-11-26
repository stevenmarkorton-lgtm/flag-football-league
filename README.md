# Flag Football League — Full Stack (Live Game + Box Score)

This is a full-stack starter app for a flag football league with live game entry and a box score editor.

## Structure
- server/ (Node + Express + SQLite)
- client/ (React + Vite)

## Quickstart
1. Install Node.js (18+ recommended)
2. Server:
   - cd server
   - npm install
   - Copy .env.example -> .env and set JWT_SECRET
   - npm run init-db
   - npm start
3. Client:
   - cd client
   - npm install
   - npm run dev
4. Admin: default account `admin` / `password` (change immediately). After logging in via /admin you should store the token in localStorage as `ff_token` for the Live UI and Box Score Editor to post updates (this is intentionally minimal for the starter app).

## Features added in this version
- Live game event API + client UI (auto-refreshing)
- Box score API + client editor (per-game, arbitrary stat keys)
- DB schema for `game_events` and `box_scores`
- Seed data and example admin user

## Next improvements
- WebSockets for real-time push updates
- Better auth (refresh tokens, roles)
- Admin UI for managing games/teams/players fully in the client
- Validation and audit logs for edits
