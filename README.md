# Kanbanium

A Kanban board Demo application inspired by Trello and Jira, built with .NET 8 and React.

## Features

### Core Kanban Features
- **Boards & Columns**: Create unlimited boards with customizable columns
- **Task Cards**: Rich task cards with drag-and-drop functionality
- **Labels**: Color-coded labels for task categorization
- **Team Collaboration**: Multi-user support with role-based access control
- **Attachments**: Upload and manage files on tasks
- **Comments**: Real-time commenting with mentions
- **Subtasks**: Track progress with nested subtasks
- **Watchers**: Follow tasks to get notified of updates

### Advanced Features
- **Real-time Updates**: Live collaboration with SignalR WebSockets
- **Advanced Search**: Filter tasks by status, type, priority, assignee, labels
- **Sprint Management**: Plan and track sprints with start/end dates
- **Activity History**: Complete audit trail of all changes
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Priority Levels**: Low, Medium, High, Critical
- **Due Dates**: Set and track task deadlines
- **Notifications**: Real-time notifications for mentions and updates

### Technical Features
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Cookie Consent**: GDPR/CCPA compliant cookie management with user preferences
- **Multi-Database Support**: PostgreSQL, MySQL, SQL Server, SQLite
- **Docker Ready**: Full Docker and Docker Compose support
- **Comprehensive Tests**: 206+ frontend tests, 42 backend test files
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Modern UI**: Built with Ant Design 5.0 components
- **Fast Performance**: Optimized with React Query caching

**⚠️ Important**: This is a **demonstration project**, not production-ready software.

---

## Quick Start with Docker

Get Kanbanium running in under 5 minutes!

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) 2.0+

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/mchase-dev/kanbanium.git
cd kanbanium

# 2. Configure environment
cp .env.example .env

# 3. Edit .env and set your JWT_KEY (required!)
# Generate a secure key:
openssl rand -base64 32

# 4. Start all services
docker-compose up -d

# 5. Access the application
open http://localhost:3000
```

**Default Login**:
- Email: `superuser@example.com`
- Password: `Superuser123!`

> **Important**: Change the default password immediately after first login!

---

## Tech Stack

### Backend
- **.NET 8**: Latest LTS version of .NET
- **ASP.NET Core**: Web API framework
- **Entity Framework Core 8**: ORM with migrations
- **MediatR**: CQRS pattern implementation
- **FluentValidation**: Input validation
- **Serilog**: Structured logging
- **SignalR**: Real-time communication
- **Swagger/OpenAPI**: API documentation
- **xUnit**: Testing framework

### Frontend
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Ant Design 5.0**: Enterprise UI component library
- **TanStack Query**: Server state management
- **React Router 7**: Client-side routing
- **@dnd-kit**: Drag and drop functionality
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **Vitest**: Fast unit testing
- **MSW**: API mocking for tests

### Database
- **PostgreSQL**: Primary production database (recommended)
- **SQLite**: Development and testing
- **SQL Server**: Enterprise support
- **MySQL**: Alternative option

---

## Installation

### Docker (Recommended)

The easiest way to run Kanbanium is with Docker Compose:

```bash
# Clone repository
git clone https://github.com/mchase-dev/kanbanium.git
cd kanbanium

# Configure environment
cp .env.example .env
# Edit .env file and set JWT_KEY

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access Points**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5124
- Swagger Docs: http://localhost:5124/swagger

### Manual Setup

#### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/)
- [PostgreSQL 16+](https://www.postgresql.org/download/) (or SQLite for development)

#### Backend Setup

```bash
cd backend

# Restore dependencies
dotnet restore

# Update appsettings.Development.json with your database connection

# Run migrations
dotnet ef database update

# Start the API
dotnet run
# or with hot reload:
dotnet watch run
```

Backend will start on http://localhost:5124

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5124/api" > .env

# Start dev server
npm run dev
```

Frontend will start on http://localhost:5173

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
# Database
DATABASE_PROVIDER=PostgreSQL
POSTGRES_DB=kanbanium
POSTGRES_USER=kanbanium
POSTGRES_PASSWORD=your_secure_password

# Backend
ASPNETCORE_ENVIRONMENT=Production
JWT_KEY=your-super-secret-jwt-key-min-32-chars
JWT_ISSUER=Kanbanium
JWT_AUDIENCE=KanbaniumClient
CORS_ALLOWED_ORIGIN=http://localhost:3000

# Frontend
VITE_API_URL=http://localhost:5124/api
```

### Database Configuration

Kanbanium supports multiple database providers. Configure in `.env`:

```bash
# For PostgreSQL (Recommended for production)
DATABASE_PROVIDER=PostgreSQL
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=kanbanium;Username=postgres;Password=password

# For SQLite (Good for development)
DATABASE_PROVIDER=Sqlite
ConnectionStrings__DefaultConnection=Data Source=kanbanium.db

# For SQL Server
DATABASE_PROVIDER=SqlServer
ConnectionStrings__DefaultConnection=Server=localhost;Database=kanbanium;User Id=sa;Password=password;

# For MySQL
DATABASE_PROVIDER=MySQL
ConnectionStrings__DefaultConnection=Server=localhost;Port=3306;Database=kanbanium;User=root;Password=password;
```

---

## Development

### Development with Docker

For development with hot reload:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This configuration:
- Mounts source code as volumes
- Enables hot reload for backend (`dotnet watch`)
- Enables HMR for frontend (Vite dev server)
- Uses SQLite instead of PostgreSQL

### Running Tests

#### Backend Tests

```bash
cd backend
dotnet test
```

**Test Coverage**:
- 42 test files
- Unit tests for all CQRS handlers
- Integration tests for API endpoints
- Domain entity tests

#### Frontend Tests

```bash
cd frontend
npm test
```

**Test Coverage**:
- 206+ tests across 17 files
- Component tests (86+ tests)
- Hook tests (98 tests)
- Context tests (16 tests)
- Integration tests with MSW (6 tests)

### Code Quality

```bash
# Backend - Check for warnings
cd backend
dotnet build /warnaserror

# Frontend - Lint
cd frontend
npm run lint

# Frontend - Type check
npm run build
```

---

## Deployment

### Production Deployment

See our comprehensive [Deployment Guide](docs/DEPLOYMENT.md) for:
- Production server setup
- SSL/TLS configuration
- Reverse proxy setup (nginx)
- Cloud deployment guides (AWS, Azure, DigitalOcean, Heroku)
- Monitoring and logging
- Backup and disaster recovery

### Docker Production

```bash
# Build and start
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Database Migrations

```bash
# Run migrations manually
./scripts/migrate.sh

# Or in Docker
docker-compose exec backend dotnet ef database update
```

---

## API Documentation

Interactive API documentation is available via Swagger:

- **Development**: http://localhost:5124/swagger
- **Production**: https://api.your-domain.com/swagger

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/current-user` - Get current user info

#### Boards
- `GET /api/boards` - Get all boards
- `POST /api/boards` - Create new board
- `GET /api/boards/{id}` - Get board details
- `PUT /api/boards/{id}` - Update board
- `DELETE /api/boards/{id}` - Delete board (soft delete)

#### Tasks
- `GET /api/tasks/board/{boardId}` - Get tasks by board
- `GET /api/tasks/column/{columnId}` - Get tasks by column
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `POST /api/tasks/{id}/move` - Move task to different column
- `POST /api/tasks/{id}/assign` - Assign task to user
- `DELETE /api/tasks/{id}` - Delete task

See full API documentation at `/swagger` endpoint.
