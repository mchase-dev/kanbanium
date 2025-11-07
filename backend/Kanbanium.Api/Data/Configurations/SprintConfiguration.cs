using Kanbanium.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kanbanium.Data.Configurations;

public class SprintConfiguration : IEntityTypeConfiguration<Sprint>
{
    public void Configure(EntityTypeBuilder<Sprint> builder)
    {
        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Goal)
            .HasMaxLength(1000);

        builder.Property(s => s.CreatedBy)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(s => s.UpdatedBy)
            .HasMaxLength(450);
    }
}
