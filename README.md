# Transcendence

Final 42 Common Core project (42school). A containerized full‑stack web app featuring authentication, profiles, real‑time gameplay (Pong), chat, and leaderboards per the subject’s requirements.

## Quick start
Requires Docker and Docker Compose.

```bash
git clone https://github.com/42rave/transcendence.git
cd transcendence
docker compose up --build
```

Then open http://localhost in your browser.

## Tech
- Dockerized services (frontend, backend, database, proxy)
- Real‑time communication (WebSockets)
- SQL database (e.g., PostgreSQL)
- Reverse proxy (e.g., Nginx)

## Notes
- For educational use as part of the 42 curriculum.
- See source and comments for implementation details.
