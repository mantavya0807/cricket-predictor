cricket-predictor/
├── client/                         # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── styles.ts
│   │   │   ├── Match/
│   │   │   │   ├── MatchCard.tsx
│   │   │   │   ├── MatchList.tsx
│   │   │   │   └── MatchDetails.tsx
│   │   │   └── Welcome/
│   │   │       └── Welcome.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   └── LiveMatches.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── match.ts
│   │   ├── utils/
│   │   └── App.tsx
│   ├── package.json
│   └── tailwind.config.js
│
├── src/                           # Your existing backend
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   └── Match.js
│   ├── services/
│   │   └── scrapers/
│   │       ├── upcomingMatchScraper.js
│   │       └── liveMatchScraper.js
│   ├── routes/
│   │   └── matches.js
│   ├── utils/
│   │   └── scraper.js
│   └── server.js
├── tests/
│   └── scrapers/
│       ├── upcomingMatches.test.js
│       └── liveMatches.test.js
├── .env
├── .gitignore
└── package.json