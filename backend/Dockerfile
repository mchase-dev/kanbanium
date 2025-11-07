# Stage 1: Base runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5124
EXPOSE 7138

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && chmod 777 /app/logs

# Stage 2: Build image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies (layer caching)
COPY ["Kanbanium.csproj", "./"]
RUN dotnet restore "Kanbanium.csproj"

# Copy all source code
COPY . .

# Build the application
RUN dotnet build "Kanbanium.csproj" -c Release -o /app/build

# Stage 3: Publish
FROM build AS publish
RUN dotnet publish "Kanbanium.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 4: Final runtime image
FROM base AS final
WORKDIR /app

# Copy published application
COPY --from=publish /app/publish .

# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:5124

# Use entrypoint script to run migrations before starting app
ENTRYPOINT ["/app/entrypoint.sh"]
