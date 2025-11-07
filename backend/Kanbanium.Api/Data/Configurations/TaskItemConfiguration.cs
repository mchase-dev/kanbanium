using Kanbanium.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kanbanium.Data.Configurations;

public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.Property(t => t.Title)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(t => t.Description)
            .HasMaxLength(10000);

        builder.Property(t => t.CreatedBy)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(t => t.UpdatedBy)
            .HasMaxLength(450);

        builder.Property(t => t.AssigneeId)
            .HasMaxLength(450);

        builder.HasOne(t => t.Assignee)
            .WithMany(u => u.AssignedTasks)
            .HasForeignKey(t => t.AssigneeId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(t => t.Board)
            .WithMany(b => b.Tasks)
            .HasForeignKey(t => t.BoardId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.Column)
            .WithMany(c => c.Tasks)
            .HasForeignKey(t => t.ColumnId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.Status)
            .WithMany(s => s.Tasks)
            .HasForeignKey(t => t.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.Type)
            .WithMany(tt => tt.Tasks)
            .HasForeignKey(t => t.TypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.Sprint)
            .WithMany(s => s.Tasks)
            .HasForeignKey(t => t.SprintId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(t => t.Comments)
            .WithOne(c => c.Task)
            .HasForeignKey(c => c.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.Attachments)
            .WithOne(a => a.Task)
            .HasForeignKey(a => a.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.SubTasks)
            .WithOne(st => st.Task)
            .HasForeignKey(st => st.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.History)
            .WithOne(h => h.Task)
            .HasForeignKey(h => h.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(t => t.PositionIndex);
        builder.HasIndex(t => new { t.ColumnId, t.PositionIndex });

        // Indexes for search and filtering
        builder.HasIndex(t => t.BoardId);
        builder.HasIndex(t => t.StatusId);
        builder.HasIndex(t => t.TypeId);
        builder.HasIndex(t => t.AssigneeId);
        builder.HasIndex(t => t.Priority);
        builder.HasIndex(t => t.SprintId);
        builder.HasIndex(t => t.IsArchived);
        builder.HasIndex(t => new { t.BoardId, t.IsArchived }); // Common combination
    }
}
