using Kanbanium.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kanbanium.Data.Configurations;

public class LabelConfiguration : IEntityTypeConfiguration<Label>
{
    public void Configure(EntityTypeBuilder<Label> builder)
    {
        builder.Property(l => l.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(l => l.Color)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(l => l.CreatedBy)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(l => l.UpdatedBy)
            .HasMaxLength(450);

        builder.HasOne(l => l.Board)
            .WithMany()
            .HasForeignKey(l => l.BoardId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
