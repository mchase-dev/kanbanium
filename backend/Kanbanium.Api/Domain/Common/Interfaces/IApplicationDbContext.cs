using Kanbanium.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<ApplicationUser> Users { get; }
    DbSet<Board> Boards { get; }
    DbSet<BoardMember> BoardMembers { get; }
    DbSet<BoardColumn> BoardColumns { get; }
    DbSet<BoardColumn> Columns { get; }
    DbSet<Status> Statuses { get; }
    DbSet<TaskType> TaskTypes { get; }
    DbSet<TaskItem> TaskItems { get; }
    DbSet<TaskItem> Tasks { get; }
    DbSet<Sprint> Sprints { get; }
    DbSet<Label> Labels { get; }
    DbSet<TaskLabel> TaskLabels { get; }
    DbSet<Comment> Comments { get; }
    DbSet<Attachment> Attachments { get; }
    DbSet<SubTask> SubTasks { get; }
    DbSet<TaskHistory> TaskHistories { get; }
    DbSet<TaskWatcher> TaskWatchers { get; }
    DbSet<RefreshToken> RefreshTokens { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
