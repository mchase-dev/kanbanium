using Kanbanium.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kanbanium.Data.Configurations;

public class SubTaskConfiguration : IEntityTypeConfiguration<SubTask>
{
    public void Configure(EntityTypeBuilder<SubTask> builder)
    {
        builder.Property(st => st.Title)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(st => st.CreatedBy)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(st => st.UpdatedBy)
            .HasMaxLength(450);

        builder.HasIndex(st => new { st.TaskId, st.Position });
    }
}
