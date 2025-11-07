using Kanbanium.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kanbanium.Data.Configurations;

public class StatusConfiguration : IEntityTypeConfiguration<Status>
{
    public void Configure(EntityTypeBuilder<Status> builder)
    {
        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.Color)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.CreatedBy)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(s => s.UpdatedBy)
            .HasMaxLength(450);
    }
}
