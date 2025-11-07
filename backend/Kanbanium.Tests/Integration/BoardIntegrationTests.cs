using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Kanbanium.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Tests.Integration;

public class BoardIntegrationTests : IntegrationTestBase
{
    public BoardIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateBoard_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        SetAuthToken(token);

        var request = new
        {
            Name = "New Project Board",
            Description = "A board for our new project"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/boards", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<ResultWrapper<BoardDto>>(JsonOptions);
        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.Name.Should().Be(request.Name);
        result.Data.Description.Should().Be(request.Description);
        result.Data.Columns.Should().NotBeEmpty(); // Should have default columns
    }

    [Fact]
    public async Task CreateBoard_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        var request = new
        {
            Name = "Test Board",
            Description = "Test"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/boards", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetBoards_ReturnsUserBoards()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        SetAuthToken(token);

        var user = await DbContext.Users.FirstAsync(u => u.Email == "test@example.com");
        await CreateTestBoardAsync(user.Id, "Board 1");
        await CreateTestBoardAsync(user.Id, "Board 2");

        // Act
        var response = await Client.GetAsync("/api/boards");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ResultWrapper<List<BoardListDto>>>(JsonOptions);
        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.Should().HaveCountGreaterThanOrEqualTo(2);
    }

    [Fact]
    public async Task GetBoardById_WithValidId_ReturnsBoard()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        SetAuthToken(token);

        var user = await DbContext.Users.FirstAsync(u => u.Email == "test@example.com");
        var board = await CreateTestBoardAsync(user.Id, "Test Board");

        // Act
        var response = await Client.GetAsync($"/api/boards/{board.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ResultWrapper<BoardDto>>(JsonOptions);
        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(board.Id);
        result.Data.Name.Should().Be(board.Name);
    }

    [Fact]
    public async Task GetBoardById_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        SetAuthToken(token);

        // Act
        var response = await Client.GetAsync($"/api/boards/{Guid.NewGuid()}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateBoard_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        SetAuthToken(token);

        var user = await DbContext.Users.FirstAsync(u => u.Email == "test@example.com");
        var board = await CreateTestBoardAsync(user.Id, "Original Name");

        var request = new
        {
            Name = "Updated Name",
            Description = "Updated description"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/boards/{board.Id}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ResultWrapper<BoardDto>>(JsonOptions);
        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.Name.Should().Be(request.Name);
        result.Data.Description.Should().Be(request.Description);
    }

    [Fact]
    public async Task AddBoardMember_AsAdmin_ReturnsSuccess()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        SetAuthToken(token);

        var user = await DbContext.Users.FirstAsync(u => u.Email == "test@example.com");
        var newUser = await CreateTestUserAsync("newmember@example.com");
        var board = await CreateTestBoardAsync(user.Id, "Shared Board");

        var request = new
        {
            UserId = newUser.Id,
            Role = BoardRole.Member
        };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/boards/{board.Id}/members", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify member was added
        var member = await DbContext.BoardMembers
            .FirstOrDefaultAsync(m => m.BoardId == board.Id && m.UserId == newUser.Id);
        member.Should().NotBeNull();
        member!.Role.Should().Be(BoardRole.Member);
    }

    [Fact]
    public async Task CreateColumn_AsAdmin_ReturnsSuccess()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        SetAuthToken(token);

        var user = await DbContext.Users.FirstAsync(u => u.Email == "test@example.com");
        var board = await CreateTestBoardAsync(user.Id, "Board with Columns");

        var request = new
        {
            Name = "In Review",
            WipLimit = 5
        };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/boards/{board.Id}/columns", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ResultWrapper<BoardColumnDto>>(JsonOptions);
        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.Name.Should().Be(request.Name);
    }

    private class ResultWrapper<T>
    {
        public bool IsSuccess { get; set; }
        public T? Data { get; set; }
        public string[] Errors { get; set; } = Array.Empty<string>();
    }

    private class BoardDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<BoardColumnDto> Columns { get; set; } = new();
    }

    private class BoardListDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    private class BoardColumnDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
