using Kanbanium.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kanbanium.Data.Configurations;

public class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
{
    public void Configure(EntityTypeBuilder<Attachment> builder)
    {
        builder.Property(a => a.FileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(a => a.FilePath)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(a => a.ContentType)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.CreatedBy)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(a => a.UpdatedBy)
            .HasMaxLength(450);

        // Performance indexes
        builder.HasIndex(a => a.TaskId);
        builder.HasIndex(a => a.CreatedBy);
        builder.HasIndex(a => a.CreatedAt);
        builder.HasIndex(a => new { a.TaskId, a.CreatedAt }); // For task attachments sorted by upload time
    }
}
