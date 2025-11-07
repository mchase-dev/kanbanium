using Kanbanium.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kanbanium.Data.Configurations;

public class BoardConfiguration : IEntityTypeConfiguration<Board>
{
    public void Configure(EntityTypeBuilder<Board> builder)
    {
        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(b => b.Description)
            .HasMaxLength(2000);

        builder.Property(b => b.BackgroundColor)
            .HasMaxLength(50);

        builder.Property(b => b.CreatedBy)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(b => b.UpdatedBy)
            .HasMaxLength(450);

        builder.HasMany(b => b.Members)
            .WithOne(m => m.Board)
            .HasForeignKey(m => m.BoardId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(b => b.Columns)
            .WithOne(c => c.Board)
            .HasForeignKey(c => c.BoardId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(b => b.Tasks)
            .WithOne(t => t.Board)
            .HasForeignKey(t => t.BoardId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(b => b.Sprints)
            .WithOne(s => s.Board)
            .HasForeignKey(s => s.BoardId)
            .OnDelete(DeleteBehavior.Restrict);

        // Performance indexes
        builder.HasIndex(b => b.CreatedBy);
        builder.HasIndex(b => b.IsArchived);
        builder.HasIndex(b => new { b.IsArchived, b.CreatedAt }); // For filtering active boards with sort
    }
}
