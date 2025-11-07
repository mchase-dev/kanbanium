using Kanbanium.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kanbanium.Data.Configurations;

public class TaskHistoryConfiguration : IEntityTypeConfiguration<TaskHistory>
{
    public void Configure(EntityTypeBuilder<TaskHistory> builder)
    {
        builder.Property(th => th.UserId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(th => th.Action)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(th => th.OldValue)
            .HasMaxLength(2000);

        builder.Property(th => th.NewValue)
            .HasMaxLength(2000);

        builder.Property(th => th.FieldName)
            .HasMaxLength(100);

        builder.HasOne(th => th.User)
            .WithMany()
            .HasForeignKey(th => th.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Performance indexes
        builder.HasIndex(th => th.TaskId);
        builder.HasIndex(th => th.UserId);
        builder.HasIndex(th => th.CreatedAt);
        builder.HasIndex(th => new { th.TaskId, th.CreatedAt }); // For task activity timeline
    }
}
