#!/bin/bash

# Database Migration Script for Kanbanium
# This script runs EF Core migrations on the database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Kanbanium Database Migration Script${NC}"
echo "======================================"

# Check if dotnet is installed
if ! command -v dotnet &> /dev/null; then
    echo -e "${RED}ERROR: dotnet CLI is not installed${NC}"
    echo "Please install .NET 8 SDK from https://dotnet.microsoft.com/download"
    exit 1
fi

# Navigate to backend directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}ERROR: Backend directory not found at $BACKEND_DIR${NC}"
    exit 1
fi

cd "$BACKEND_DIR"
echo "Working directory: $(pwd)"

# Check if EF Core tools are installed
if ! dotnet ef &> /dev/null; then
    echo -e "${YELLOW}EF Core tools not found. Installing...${NC}"
    dotnet tool install --global dotnet-ef || {
        echo -e "${RED}ERROR: Failed to install dotnet-ef tools${NC}"
        exit 1
    }
fi

# Load environment variables if .env file exists
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo "Loading environment variables from .env..."
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
fi

# Display current configuration
echo ""
echo "Configuration:"
echo "  Database Provider: ${DATABASE_PROVIDER:-Sqlite}"
echo "  Environment: ${ASPNETCORE_ENVIRONMENT:-Production}"

# Check database connection
echo ""
echo "Checking database connection..."

case "${DATABASE_PROVIDER:-Sqlite}" in
    "PostgreSQL")
        if ! command -v pg_isready &> /dev/null; then
            echo -e "${YELLOW}WARNING: pg_isready not found, skipping connection test${NC}"
        else
            PG_HOST=$(echo "${ConnectionStrings__DefaultConnection}" | grep -oP '(?<=Host=)[^;]+' || echo "localhost")
            PG_PORT=$(echo "${ConnectionStrings__DefaultConnection}" | grep -oP '(?<=Port=)[^;]+' || echo "5432")
            echo "Testing PostgreSQL connection to $PG_HOST:$PG_PORT..."

            if pg_isready -h "$PG_HOST" -p "$PG_PORT" > /dev/null 2>&1; then
                echo -e "${GREEN}✓ Database is ready${NC}"
            else
                echo -e "${YELLOW}WARNING: Cannot connect to PostgreSQL. Migration may fail.${NC}"
                read -p "Continue anyway? (y/N): " -n 1 -r
                echo
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    exit 1
                fi
            fi
        fi
        ;;
    "Sqlite")
        echo "Using SQLite (no connection test needed)"
        ;;
    *)
        echo "Database provider: ${DATABASE_PROVIDER}"
        echo -e "${YELLOW}Skipping connection test for this provider${NC}"
        ;;
esac

# List available migrations
echo ""
echo "Available migrations:"
dotnet ef migrations list || {
    echo -e "${YELLOW}WARNING: Could not list migrations${NC}"
}

# Run migrations
echo ""
echo "Applying database migrations..."
dotnet ef database update --verbose || {
    echo -e "${RED}ERROR: Migration failed${NC}"
    exit 1
}

echo ""
echo -e "${GREEN}✓ Database migrations completed successfully!${NC}"

# Optional: Display migration history
echo ""
echo "Checking if __EFMigrationsHistory table exists..."
if [ "${DATABASE_PROVIDER:-Sqlite}" == "Sqlite" ]; then
    if [ -f "kanbanium.db" ]; then
        echo "Applied migrations:"
        sqlite3 kanbanium.db "SELECT MigrationId, ProductVersion FROM __EFMigrationsHistory;" 2>/dev/null || {
            echo -e "${YELLOW}Could not read migration history${NC}"
        }
    fi
fi

echo ""
echo -e "${GREEN}Migration script completed!${NC}"
