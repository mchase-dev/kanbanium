using Kanbanium.Domain.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Kanbanium.Data;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // Load configuration from appsettings.json
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

        // Read database provider and connection string from configuration
        var databaseProvider = configuration.GetValue<string>("Database:Provider") ?? "Sqlite";
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        // Configure the appropriate database provider
        switch (databaseProvider.ToLower())
        {
            case "sqlserver":
                optionsBuilder.UseSqlServer(connectionString);
                break;
            case "postgresql":
                optionsBuilder.UseNpgsql(connectionString);
                break;
            case "mysql":
                optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
                break;
            case "sqlite":
            default:
                optionsBuilder.UseSqlite(connectionString);
                break;
        }

        // Create a mock CurrentUserService for design-time
        var mockUserService = new DesignTimeUserService();

        return new ApplicationDbContext(optionsBuilder.Options, mockUserService);
    }

    private class DesignTimeUserService : ICurrentUserService
    {
        public string? UserId => "System";
        public string? UserName => "System";
        public bool IsAuthenticated => false;
    }
}
