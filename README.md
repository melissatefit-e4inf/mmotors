# M-Motors Plateforme d'Achat & Location Longue Durée 
Bienvenue sur le dépôt officiel du projet de refonte applicative de **M-Motors**.

---

##  Liens de Déploiement et Accès

| Ressource | URL / Identifiants |
| :--- | :--- |
| **Application (Production)** | https://mmotors-frontend.onrender.com |
| **Documentation API (Swagger)** | https://mmotorsmmotors-backend.onrender.com/docs |
| **Dépôt GitHub** | https://github.com/melissatefit-e4inf/mmotors |
| **Identifiants Admin** | `admin@mmotors.fr` / `Admin123!` |
| **Identifiants Client** | `user@mmotors.fr` / `User123!` |

---

##  Stack Technique

- **Back-End :** Python 3.11+ avec FastAPI
- **Front-End :** React 18 + Vite
- **Base de données :** PostgreSQL (Supabase, EU Frankfurt)
- **Déploiement :** Render (backend + frontend)
- **Monitoring :** Sentry
- **Tests :** Pytest + pytest-cov (87% couverture)

---

##  Sécurité

- JWT obligatoire sur toutes les routes sensibles
- Séparation rôles admin/client (403 Forbidden)
- Rate limiting 5 tentatives/minute sur /auth/login
- CORS restreint aux domaines autorisés
- Headers de sécurité HTTP
- SECRET_KEY 256 bits
- Historique Git nettoyé (git-filter-repo)
- RLS activé sur Supabase

---

##  Installation locale

### Back-End
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Front-End
```bash
cd frontend
npm install
npm run dev
```

### Tests
```bash
cd backend
source .venv/bin/activate
python -m pytest tests/ -v --cov=app --cov-report=term-missing
```

---

##  GitFlow

- `main` → production, déployée sur Render
- `develop` → intégration
- `feature/us-XX-nom` → une branche par User Story
