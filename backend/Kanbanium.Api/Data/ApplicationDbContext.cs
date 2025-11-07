using System.Linq.Expressions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.Data.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>, IApplicationDbContext
{
    private readonly ICurrentUserService _currentUserService;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ICurrentUserService currentUserService) : base(options)
    {
        _currentUserService = currentUserService;
    }

    public DbSet<Board> Boards => Set<Board>();
    public DbSet<BoardMember> BoardMembers => Set<BoardMember>();
    public DbSet<BoardColumn> BoardColumns => Set<BoardColumn>();
    public DbSet<BoardColumn> Columns => Set<BoardColumn>();
    public DbSet<Status> Statuses => Set<Status>();
    public DbSet<TaskType> TaskTypes => Set<TaskType>();
    public DbSet<TaskItem> TaskItems => Set<TaskItem>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Sprint> Sprints => Set<Sprint>();
    public DbSet<Label> Labels => Set<Label>();
    public DbSet<TaskLabel> TaskLabels => Set<TaskLabel>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<SubTask> SubTasks => Set<SubTask>();
    public DbSet<TaskHistory> TaskHistories => Set<TaskHistory>();
    public DbSet<TaskWatcher> TaskWatchers => Set<TaskWatcher>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Apply global query filter for soft delete
        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            if (typeof(BaseAuditableEntity).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var property = Expression.Property(parameter, nameof(BaseAuditableEntity.DeletedAt));
                var nullConstant = Expression.Constant(null, typeof(DateTime?));
                var condition = Expression.Equal(property, nullConstant);
                var lambda = Expression.Lambda(condition, parameter);

                builder.Entity(entityType.ClrType).HasQueryFilter(lambda);
            }
        }

        // Add query filters for join tables to match parent entity filters
        // TaskLabel: Only show labels for non-deleted tasks and labels
        builder.Entity<TaskLabel>()
            .HasQueryFilter(tl => tl.Task.DeletedAt == null && tl.Label.DeletedAt == null);

        // TaskWatcher: Only show watchers for non-deleted tasks
        builder.Entity<TaskWatcher>()
            .HasQueryFilter(tw => tw.Task.DeletedAt == null);

        // TaskHistory: Make Task navigation optional to allow accessing history of deleted tasks
        builder.Entity<TaskHistory>()
            .Navigation(th => th.Task)
            .IsRequired(false);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries<BaseAuditableEntity>();

        foreach (var entry in entries)
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    entry.Entity.CreatedBy = _currentUserService.UserId ?? "System";
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    entry.Entity.UpdatedBy = _currentUserService.UserId ?? "System";
                    break;

                case EntityState.Deleted:
                    entry.State = EntityState.Modified;
                    entry.Entity.DeletedAt = DateTime.UtcNow;
                    entry.Entity.UpdatedBy = _currentUserService.UserId ?? "System";
                    break;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
