using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Kanbanium.Data;
using Kanbanium.Data.Entities;
using Kanbanium.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Kanbanium.Tests.Integration;

public abstract class IntegrationTestBase : IClassFixture<CustomWebApplicationFactory>, IDisposable
{
    protected readonly HttpClient Client;
    protected readonly CustomWebApplicationFactory Factory;
    protected readonly IServiceScope Scope;
    protected readonly ApplicationDbContext DbContext;
    protected readonly UserManager<ApplicationUser> UserManager;

    protected readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    protected IntegrationTestBase(CustomWebApplicationFactory factory)
    {
        Factory = factory;
        Client = factory.CreateClient();
        Scope = factory.Services.CreateScope();
        DbContext = Scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        UserManager = Scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    }

    protected async Task<string> GetAuthTokenAsync(string email = "test@example.com", string password = "Test123!")
    {
        // Try to login first
        var loginRequest = new { Email = email, Password = password };
        var loginResponse = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);

        if (loginResponse.IsSuccessStatusCode)
        {
            var loginResult = await loginResponse.Content.ReadFromJsonAsync<ResultWrapper<AuthResponse>>(JsonOptions);
            return loginResult!.Data!.AccessToken;
        }

        // If login fails, register the user
        var registerRequest = new
        {
            UserName = email.Split('@')[0], // Use email prefix as username
            Email = email,
            Password = password,
            FirstName = "Test",
            LastName = "User"
        };

        var registerResponse = await Client.PostAsJsonAsync("/api/auth/register", registerRequest);

        // If registration succeeds, return the token
        if (registerResponse.IsSuccessStatusCode)
        {
            var registerResult = await registerResponse.Content.ReadFromJsonAsync<ResultWrapper<AuthResponse>>(JsonOptions);
            return registerResult!.Data!.AccessToken;
        }

        // If registration fails (e.g., user already exists), try login again
        loginResponse = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);
        loginResponse.EnsureSuccessStatusCode();

        var finalLoginResult = await loginResponse.Content.ReadFromJsonAsync<ResultWrapper<AuthResponse>>(JsonOptions);
        return finalLoginResult!.Data!.AccessToken;
    }

    protected void SetAuthToken(string token)
    {
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    protected async Task<ApplicationUser> CreateTestUserAsync(string email, string password = "Test123!")
    {
        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FirstName = "Test",
            LastName = "User",
            EmailConfirmed = true
        };

        var result = await UserManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            throw new Exception($"Failed to create user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }

        return user;
    }

    protected async Task<Board> CreateTestBoardAsync(string userId, string name = "Test Board")
    {
        var board = new Board
        {
            Name = name,
            Description = "Test board description",
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow
        };

        DbContext.Boards.Add(board);
        await DbContext.SaveChangesAsync();

        // Add creator as admin member
        var member = new BoardMember
        {
            BoardId = board.Id,
            UserId = userId,
            Role = BoardRole.Admin,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow
        };

        DbContext.BoardMembers.Add(member);
        await DbContext.SaveChangesAsync();

        return board;
    }

    protected async Task<Status> GetOrCreateStatusAsync(string name = "To Do")
    {
        var status = await DbContext.Statuses.FirstOrDefaultAsync(s => s.Name == name);
        if (status == null)
        {
            status = new Status
            {
                Name = name,
                Category = StatusCategory.ToDo,
                Color = "#6B7280"
            };
            DbContext.Statuses.Add(status);
            await DbContext.SaveChangesAsync();
        }
        return status;
    }

    protected async Task<TaskType> GetOrCreateTaskTypeAsync(string name = "Task")
    {
        var taskType = await DbContext.TaskTypes.FirstOrDefaultAsync(t => t.Name == name);
        if (taskType == null)
        {
            taskType = new TaskType
            {
                Name = name,
                Icon = "📋",
                Color = "#3B82F6"
            };
            DbContext.TaskTypes.Add(taskType);
            await DbContext.SaveChangesAsync();
        }
        return taskType;
    }

    protected async Task<BoardColumn> GetOrCreateBoardColumnAsync(Guid boardId, string name = "To Do")
    {
        var column = await DbContext.BoardColumns.FirstOrDefaultAsync(c => c.BoardId == boardId && c.Name == name);
        if (column == null)
        {
            column = new BoardColumn
            {
                BoardId = boardId,
                Name = name,
                Position = 0,
                WipLimit = null
            };
            DbContext.BoardColumns.Add(column);
            await DbContext.SaveChangesAsync();
        }
        return column;
    }

    public void Dispose()
    {
        Scope?.Dispose();
        Client?.Dispose();
    }

    private class ResultWrapper<T>
    {
        public bool IsSuccess { get; set; }
        public T? Data { get; set; }
        public string[] Errors { get; set; } = Array.Empty<string>();
    }

    private class AuthResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}
