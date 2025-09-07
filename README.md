# Gujarat Real Estate Analytics Platform

A data-driven platform providing real-time insights into Gujarat's real estate market for both builders and property buyers.

## Features

### For Builders
- Market opportunity analysis
- Competition intelligence
- Pricing optimization
- Demand forecasting

### For Buyers
- RERA-verified project data
- Developer reliability scores
- Investment insights
- Market trends

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with PostGIS
- **Scraping**: Puppeteer, Cheerio
- **Maps**: Mapbox GL
- **Analytics**: Chart.js, D3.js

## Project Structure

```
├── backend/           # Node.js API server
├── frontend/          # Next.js application
├── scraper/          # RERA data scraping service
├── database/         # Database schemas and migrations
└── docker/           # Docker configurations
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (for caching)

### Installation

```bash
# Clone repository
git clone [repository-url]

# Install dependencies
npm run install:all

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev
```

## License

Proprietary - All rights reserved