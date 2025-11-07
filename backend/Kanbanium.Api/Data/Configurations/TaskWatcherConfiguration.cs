using Kanbanium.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kanbanium.Data.Configurations;

public class TaskWatcherConfiguration : IEntityTypeConfiguration<TaskWatcher>
{
    public void Configure(EntityTypeBuilder<TaskWatcher> builder)
    {
        builder.HasKey(tw => new { tw.TaskId, tw.UserId });

        builder.Property(tw => tw.UserId)
            .HasMaxLength(450);

        builder.HasOne(tw => tw.Task)
            .WithMany(t => t.Watchers)
            .HasForeignKey(tw => tw.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(tw => tw.User)
            .WithMany()
            .HasForeignKey(tw => tw.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
