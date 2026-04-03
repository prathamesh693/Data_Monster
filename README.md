# DataGuard

DataGuard is a comprehensive data governance and quality monitoring platform that helps organizations maintain high-quality data across their databases. It provides automated data quality checks, AI-powered recommendations, governance policies, and interactive query capabilities.

## Features

- **Data Quality Monitoring**: Automated checks for completeness, timeliness, uniqueness, consistency, and validity
- **AI-Powered Recommendations**: Machine learning-driven suggestions for data improvements and issue resolution
- **Data Governance**: Policy management and compliance monitoring
- **Interactive Dashboard**: Real-time metrics and visualizations
- **Query Explorer**: Safe SQL query interface for data exploration
- **Multi-Database Support**: Connect to PostgreSQL, MySQL, MongoDB, SQL Server, Snowflake, and more
- **Real-time Alerts**: Automated notifications for data quality issues

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Recharts
- **Backend**: Node.js + Express
- **AI/ML Service**: Python + FastAPI + Transformers + Scikit-learn
- **Databases**: PostgreSQL (primary), MySQL, MongoDB, SQL Server, Snowflake, SQLite
- **Caching**: Redis

## Project Structure

```
DataGuard/
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Main application pages
│   │   └── api/         # API client functions
│   ├── package.json
│   └── vite.config.js
├── server/              # Node.js Express backend
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── services/    # Business logic
│   │   ├── routes/      # API route definitions
│   │   └── db/          # Database connection modules
│   ├── package.json
│   └── .env.example
├── python_service/      # Python AI/ML service
│   └── requirements.txt
├── start.bat            # Windows startup script
├── stop.bat             # Windows shutdown script
├── package.json         # Root monorepo configuration
└── README.md
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://python.org/)
- **PostgreSQL** (or your preferred database)
- **Redis** (optional, for caching)
- **Git** - [Download](https://git-scm.com/)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd DataGuard
```

### 2. Install Node.js Dependencies

**Location**: Root directory (`DataGuard/`)

```bash
# Install root dependencies
npm install

# Install frontend dependencies
npm install --prefix client

# Install backend dependencies
npm install --prefix server
```

### 3. Install Python Dependencies

**Location**: `python_service/` directory

```bash
cd python_service
pip install -r requirements.txt
cd ..
```

### 4. Database Setup

- Install and start PostgreSQL (or your chosen database)
- Create a database for the application
- Note the connection details for configuration

### 5. Environment Configuration

**Location**: `server/` directory

```bash
cd server
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# Database Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dataguard
DB_USER=your_username
DB_PASSWORD=your_password

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Python Service
PYTHON_SERVICE_URL=http://localhost:8000
```

## Running the Application

### Development Mode

**Location**: Root directory (`DataGuard/`)

```bash
# Start all services (frontend, backend, and Python service)
npm run dev
```

This will start:
- Frontend at `http://localhost:5173`
- Backend at `http://localhost:3000`
- Python service at `http://localhost:8000`

### Individual Services

**Frontend Only**:
```bash
npm run client
```

**Backend Only**:
```bash
npm run server
```

**Python Service Only**:
```bash
cd python_service
uvicorn main:app --reload
```

### Production Build

**Location**: Root directory

```bash
# Build frontend for production
npm run build

# Start backend in production mode
npm run server
```

## Development

### Adding New Features

1. **Frontend Changes**: Work in `client/src/`
2. **Backend API**: Add routes in `server/src/routes/`, controllers in `server/src/controllers/`
3. **AI/ML Features**: Implement in `python_service/`
4. **Database Models**: Update in `server/src/db/`

### Testing

```bash
# Frontend linting
cd client
npm run lint

# Backend testing (if configured)
cd server
npm test
```

### Database Migrations

When adding new database features:

1. Update connection modules in `server/src/db/`
2. Test connections using `/api/db/status` endpoint
3. Update environment variables as needed

## API Documentation

### Base Endpoints

- `GET /api` - API information
- `GET /api/health` - Service health check
- `GET /api/db/status` - Database connection status

### Data Quality

- `GET /api/quality-checks` - Quality metrics summary
- `GET /api/quality-list` - Detailed quality check results

### Governance

- `GET /api/governance` - Governance policies and status

### Recommendations

- `GET /api/recommendations` - AI-generated recommendations

### Query Explorer

- `POST /api/query` - Execute SQL queries safely

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 3000, 5173, and 8000 are available
2. **Database Connection**: Verify credentials in `server/.env`
3. **Python Dependencies**: Ensure Python 3.8+ and pip are installed
4. **Node Modules**: Delete `node_modules` and reinstall if issues persist

### Logs

- Frontend: Browser console
- Backend: Terminal output from `npm run server`
- Python: Terminal output from uvicorn

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License
