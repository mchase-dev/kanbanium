using Kanbanium.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Data.Migrations;

public static class ApplicationDbContextSeed
{
    public static async Task<bool> SeedAsync(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        ILogger logger)
    {
        try
        {
            var seededAnything = false;
            var hadErrors = false;

            // Seed roles
            var (rolesSeeded, rolesHadErrors) = await SeedRolesAsync(roleManager, logger);
            if (rolesSeeded) seededAnything = true;
            if (rolesHadErrors) hadErrors = true;

            // Seed default users
            var (usersSeeded, usersHadErrors) = await SeedDefaultUsersAsync(userManager, logger);
            if (usersSeeded) seededAnything = true;
            if (usersHadErrors) hadErrors = true;

            // Seed statuses
            if (await SeedStatusesAsync(context, logger))
                seededAnything = true;

            // Seed task types
            if (await SeedTaskTypesAsync(context, logger))
                seededAnything = true;

            if (seededAnything)
            {
                await context.SaveChangesAsync();
            }

            // Only return true if we seeded something AND had no errors
            return seededAnything && !hadErrors;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database");
            throw;
        }
    }

    private static async Task<(bool seeded, bool hadErrors)> SeedRolesAsync(RoleManager<IdentityRole> roleManager, ILogger logger)
    {
        var roles = new[] { "User", "Manager", "Admin", "Superuser" };
        var seeded = false;
        var hadErrors = false;

        foreach (var roleName in roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                var result = await roleManager.CreateAsync(new IdentityRole(roleName));
                if (result.Succeeded)
                {
                    logger.LogInformation("Created role: {RoleName}", roleName);
                    seeded = true;
                }
                else
                {
                    logger.LogError("Failed to create role: {RoleName}", roleName);
                    hadErrors = true;
                }
            }
        }

        return (seeded, hadErrors);
    }

    private static async Task<(bool seeded, bool hadErrors)> SeedDefaultUsersAsync(UserManager<ApplicationUser> userManager, ILogger logger)
    {
        var seeded = false;
        var hadErrors = false;

        // Seed Superuser
        var superuserEmail = "superuser@example.com";
        var superuser = await userManager.FindByEmailAsync(superuserEmail);

        if (superuser == null)
        {
            superuser = new ApplicationUser
            {
                UserName = "superuser",
                Email = superuserEmail,
                FirstName = "Super",
                LastName = "User",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(superuser, "Please_change_123!");

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(superuser, "Superuser");
                logger.LogInformation("Created default superuser: {Email}", superuserEmail);
                seeded = true;
            }
            else
            {
                logger.LogError("Failed to create default superuser: {Errors}",
                    string.Join(", ", result.Errors.Select(e => e.Description)));
                hadErrors = true;
            }
        }

        // Seed Admin
        var adminEmail = "admin@example.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = "admin",
                Email = adminEmail,
                FirstName = "Admin",
                LastName = "User",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(adminUser, "Please_change_123!");

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
                logger.LogInformation("Created default admin user: {Email}", adminEmail);
                seeded = true;
            }
            else
            {
                logger.LogError("Failed to create default admin user: {Errors}",
                    string.Join(", ", result.Errors.Select(e => e.Description)));
                hadErrors = true;
            }
        }

        return (seeded, hadErrors);
    }

    private static async Task<bool> SeedStatusesAsync(ApplicationDbContext context, ILogger logger)
    {
        if (!await context.Statuses.AnyAsync())
        {
            var statuses = new[]
            {
                new Status
                {
                    Id = Guid.NewGuid(),
                    Name = "To Do",
                    Category = StatusCategory.ToDo,
                    Color = "#6B7280",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System"
                },
                new Status
                {
                    Id = Guid.NewGuid(),
                    Name = "In Progress",
                    Category = StatusCategory.InProgress,
                    Color = "#3B82F6",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System"
                },
                new Status
                {
                    Id = Guid.NewGuid(),
                    Name = "In Review",
                    Category = StatusCategory.InProgress,
                    Color = "#F59E0B",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System"
                },
                new Status
                {
                    Id = Guid.NewGuid(),
                    Name = "Done",
                    Category = StatusCategory.Done,
                    Color = "#10B981",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System"
                }
            };

            context.Statuses.AddRange(statuses);
            logger.LogInformation("Seeded {Count} default statuses", statuses.Length);
            return true;
        }

        return false;
    }

    private static async Task<bool> SeedTaskTypesAsync(ApplicationDbContext context, ILogger logger)
    {
        if (!await context.TaskTypes.AnyAsync())
        {
            var taskTypes = new[]
            {
                new TaskType
                {
                    Id = Guid.NewGuid(),
                    Name = "Task",
                    Icon = "task",
                    Color = "#6B7280",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System"
                },
                new TaskType
                {
                    Id = Guid.NewGuid(),
                    Name = "Bug",
                    Icon = "bug",
                    Color = "#EF4444",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System"
                },
                new TaskType
                {
                    Id = Guid.NewGuid(),
                    Name = "Feature",
                    Icon = "star",
                    Color = "#8B5CF6",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System"
                },
                new TaskType
                {
                    Id = Guid.NewGuid(),
                    Name = "Improvement",
                    Icon = "arrow-up",
                    Color = "#3B82F6",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System"
                }
            };

            context.TaskTypes.AddRange(taskTypes);
            logger.LogInformation("Seeded {Count} default task types", taskTypes.Length);
            return true;
        }

        return false;
    }
}
