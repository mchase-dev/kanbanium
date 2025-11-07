using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Kanbanium.Services;

public class NotificationService : INotificationService
{
    private readonly IHubContext<KanbanHub> _hubContext;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IHubContext<KanbanHub> hubContext,
        ILogger<NotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    // Task notifications
    public async Task TaskCreated(string boardId, string taskId)
    {
        _logger.LogInformation("Broadcasting TaskCreated event for board {BoardId}, task {TaskId}", boardId, taskId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("TaskCreated", new { boardId, taskId });
    }

    public async Task TaskUpdated(string boardId, string taskId)
    {
        _logger.LogInformation("Broadcasting TaskUpdated event for board {BoardId}, task {TaskId}", boardId, taskId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("TaskUpdated", new { boardId, taskId });
    }

    public async Task TaskMoved(string boardId, string taskId, string fromColumnId, string toColumnId)
    {
        _logger.LogInformation("Broadcasting TaskMoved event for board {BoardId}, task {TaskId} from {FromColumnId} to {ToColumnId}",
            boardId, taskId, fromColumnId, toColumnId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("TaskMoved", new { boardId, taskId, fromColumnId, toColumnId });
    }

    public async Task TaskDeleted(string boardId, string taskId)
    {
        _logger.LogInformation("Broadcasting TaskDeleted event for board {BoardId}, task {TaskId}", boardId, taskId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("TaskDeleted", new { boardId, taskId });
    }

    public async Task TaskArchived(string boardId, string taskId)
    {
        _logger.LogInformation("Broadcasting TaskArchived event for board {BoardId}, task {TaskId}", boardId, taskId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("TaskArchived", new { boardId, taskId });
    }

    public async Task TaskUnarchived(string boardId, string taskId)
    {
        _logger.LogInformation("Broadcasting TaskUnarchived event for board {BoardId}, task {TaskId}", boardId, taskId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("TaskUnarchived", new { boardId, taskId });
    }

    public async Task TaskAssigned(string boardId, string taskId, string? assigneeId)
    {
        _logger.LogInformation("Broadcasting TaskAssigned event for board {BoardId}, task {TaskId}, assignee {AssigneeId}",
            boardId, taskId, assigneeId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("TaskAssigned", new { boardId, taskId, assigneeId });
    }

    // Comment notifications
    public async Task CommentCreated(string boardId, string taskId, string commentId)
    {
        _logger.LogInformation("Broadcasting CommentCreated event for board {BoardId}, task {TaskId}, comment {CommentId}",
            boardId, taskId, commentId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("CommentCreated", new { boardId, taskId, commentId });
    }

    public async Task CommentUpdated(string boardId, string taskId, string commentId)
    {
        _logger.LogInformation("Broadcasting CommentUpdated event for board {BoardId}, task {TaskId}, comment {CommentId}",
            boardId, taskId, commentId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("CommentUpdated", new { boardId, taskId, commentId });
    }

    public async Task CommentDeleted(string boardId, string taskId, string commentId)
    {
        _logger.LogInformation("Broadcasting CommentDeleted event for board {BoardId}, task {TaskId}, comment {CommentId}",
            boardId, taskId, commentId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("CommentDeleted", new { boardId, taskId, commentId });
    }

    // Column notifications
    public async Task ColumnCreated(string boardId, string columnId)
    {
        _logger.LogInformation("Broadcasting ColumnCreated event for board {BoardId}, column {ColumnId}", boardId, columnId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("ColumnCreated", new { boardId, columnId });
    }

    public async Task ColumnUpdated(string boardId, string columnId)
    {
        _logger.LogInformation("Broadcasting ColumnUpdated event for board {BoardId}, column {ColumnId}", boardId, columnId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("ColumnUpdated", new { boardId, columnId });
    }

    public async Task ColumnDeleted(string boardId, string columnId)
    {
        _logger.LogInformation("Broadcasting ColumnDeleted event for board {BoardId}, column {ColumnId}", boardId, columnId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("ColumnDeleted", new { boardId, columnId });
    }

    public async Task ColumnsReordered(string boardId)
    {
        _logger.LogInformation("Broadcasting ColumnsReordered event for board {BoardId}", boardId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("ColumnsReordered", new { boardId });
    }

    // Board notifications
    public async Task BoardUpdated(string boardId)
    {
        _logger.LogInformation("Broadcasting BoardUpdated event for board {BoardId}", boardId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("BoardUpdated", new { boardId });
    }

    public async Task BoardArchived(string boardId)
    {
        _logger.LogInformation("Broadcasting BoardArchived event for board {BoardId}", boardId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("BoardArchived", new { boardId });
    }

    public async Task BoardUnarchived(string boardId)
    {
        _logger.LogInformation("Broadcasting BoardUnarchived event for board {BoardId}", boardId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("BoardUnarchived", new { boardId });
    }

    // Member notifications
    public async Task MemberAdded(string boardId, string userId)
    {
        _logger.LogInformation("Broadcasting MemberAdded event for board {BoardId}, user {UserId}", boardId, userId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("MemberAdded", new { boardId, userId });
    }

    public async Task MemberRemoved(string boardId, string userId)
    {
        _logger.LogInformation("Broadcasting MemberRemoved event for board {BoardId}, user {UserId}", boardId, userId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("MemberRemoved", new { boardId, userId });
    }

    public async Task MemberRoleUpdated(string boardId, string userId)
    {
        _logger.LogInformation("Broadcasting MemberRoleUpdated event for board {BoardId}, user {UserId}", boardId, userId);
        await _hubContext.Clients.Group(GetBoardGroup(boardId))
            .SendAsync("MemberRoleUpdated", new { boardId, userId });
    }

    public async Task UserMentioned(string userId, string boardId, string taskId, string commentId, string mentionedByUserId)
    {
        _logger.LogInformation("Notifying user {UserId} of mention in comment {CommentId} on task {TaskId}", userId, commentId, taskId);
        await _hubContext.Clients.User(userId)
            .SendAsync("UserMentioned", new { boardId, taskId, commentId, mentionedByUserId });
    }

    private static string GetBoardGroup(string boardId) => $"board_{boardId}";
}
