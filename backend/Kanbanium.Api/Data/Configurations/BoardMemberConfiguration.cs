using Kanbanium.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kanbanium.Data.Configurations;

public class BoardMemberConfiguration : IEntityTypeConfiguration<BoardMember>
{
    public void Configure(EntityTypeBuilder<BoardMember> builder)
    {
        builder.Property(bm => bm.UserId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(bm => bm.CreatedBy)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(bm => bm.UpdatedBy)
            .HasMaxLength(450);

        builder.HasOne(bm => bm.User)
            .WithMany(u => u.BoardMemberships)
            .HasForeignKey(bm => bm.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(bm => new { bm.BoardId, bm.UserId }).IsUnique();
    }
}
