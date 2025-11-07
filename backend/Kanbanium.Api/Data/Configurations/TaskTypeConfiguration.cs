using Kanbanium.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kanbanium.Data.Configurations;

public class TaskTypeConfiguration : IEntityTypeConfiguration<TaskType>
{
    public void Configure(EntityTypeBuilder<TaskType> builder)
    {
        builder.Property(tt => tt.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(tt => tt.Icon)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(tt => tt.Color)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(tt => tt.CreatedBy)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(tt => tt.UpdatedBy)
            .HasMaxLength(450);
    }
}
