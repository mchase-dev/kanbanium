using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Kanbanium.Hubs;

[Authorize]
public class KanbanHub : Hub
{
    private readonly ILogger<KanbanHub> _logger;

    public KanbanHub(ILogger<KanbanHub> logger)
    {
        _logger = logger;
    }

    public async Task JoinBoard(string boardId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, GetBoardGroup(boardId));
        _logger.LogInformation("User {UserId} joined board {BoardId} with connection {ConnectionId}",
            Context.User?.Identity?.Name, boardId, Context.ConnectionId);
    }

    public async Task LeaveBoard(string boardId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetBoardGroup(boardId));
        _logger.LogInformation("User {UserId} left board {BoardId} with connection {ConnectionId}",
            Context.User?.Identity?.Name, boardId, Context.ConnectionId);
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {ConnectionId}, User: {UserId}",
            Context.ConnectionId, Context.User?.Identity?.Name);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {ConnectionId}, User: {UserId}, Exception: {Exception}",
            Context.ConnectionId, Context.User?.Identity?.Name, exception?.Message);
        await base.OnDisconnectedAsync(exception);
    }

    private static string GetBoardGroup(string boardId) => $"board_{boardId}";
}
