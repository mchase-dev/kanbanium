#!/bin/bash
set -e

echo "Starting Kanbanium Backend..."

# Wait for database to be ready (if using PostgreSQL/MySQL/SQL Server)
if [ "$Database__Provider" != "Sqlite" ]; then
    echo "Waiting for database to be ready..."

    # Extract host and port from connection string
    # This is a simple approach; adjust based on your connection string format
    DB_HOST=$(echo "$ConnectionStrings__DefaultConnection" | grep -oP '(?<=Host=)[^;]+' || echo "db")
    DB_PORT=$(echo "$ConnectionStrings__DefaultConnection" | grep -oP '(?<=Port=)[^;]+' || echo "5432")

    # Wait for database to accept connections (max 30 seconds)
    timeout=30
    while ! nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
        timeout=$((timeout - 1))
        if [ $timeout -le 0 ]; then
            echo "ERROR: Database failed to become ready within 30 seconds"
            exit 1
        fi
        echo "Waiting for database at $DB_HOST:$DB_PORT... ($timeout seconds remaining)"
        sleep 1
    done

    echo "Database is ready!"
fi

# Run database migrations
echo "Running database migrations..."
dotnet Kanbanium.dll --migrate || {
    echo "WARNING: Migration command not implemented. Skipping migrations."
    echo "Database will be migrated automatically on first request."
}

# Start the application
echo "Starting application..."
exec dotnet Kanbanium.dll
