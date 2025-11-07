namespace Kanbanium.Domain.Common.Interfaces;

public interface INotificationService
{
    // Task notifications
    Task TaskCreated(string boardId, string taskId);
    Task TaskUpdated(string boardId, string taskId);
    Task TaskMoved(string boardId, string taskId, string fromColumnId, string toColumnId);
    Task TaskDeleted(string boardId, string taskId);
    Task TaskArchived(string boardId, string taskId);
    Task TaskUnarchived(string boardId, string taskId);
    Task TaskAssigned(string boardId, string taskId, string? assigneeId);

    // Comment notifications
    Task CommentCreated(string boardId, string taskId, string commentId);
    Task CommentUpdated(string boardId, string taskId, string commentId);
    Task CommentDeleted(string boardId, string taskId, string commentId);

    // Column notifications
    Task ColumnCreated(string boardId, string columnId);
    Task ColumnUpdated(string boardId, string columnId);
    Task ColumnDeleted(string boardId, string columnId);
    Task ColumnsReordered(string boardId);

    // Board notifications
    Task BoardUpdated(string boardId);
    Task BoardArchived(string boardId);
    Task BoardUnarchived(string boardId);

    // Member notifications
    Task MemberAdded(string boardId, string userId);
    Task MemberRemoved(string boardId, string userId);
    Task MemberRoleUpdated(string boardId, string userId);

    // Mention notifications
    Task UserMentioned(string userId, string boardId, string taskId, string commentId, string mentionedByUserId);
}
