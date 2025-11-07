using Kanbanium.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kanbanium.Data.Configurations;

public class BoardColumnConfiguration : IEntityTypeConfiguration<BoardColumn>
{
    public void Configure(EntityTypeBuilder<BoardColumn> builder)
    {
        builder.Property(bc => bc.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(bc => bc.CreatedBy)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(bc => bc.UpdatedBy)
            .HasMaxLength(450);

        builder.HasOne(bc => bc.Status)
            .WithMany(s => s.Columns)
            .HasForeignKey(bc => bc.StatusId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(bc => new { bc.BoardId, bc.Position });
    }
}
