using FluentValidation;

namespace Kanbanium.Domain.Attachments.Commands.UploadAttachment;

public class UploadAttachmentCommandValidator : AbstractValidator<UploadAttachmentCommand>
{
    // Max file size: 10MB
    private const long MaxFileSize = 10 * 1024 * 1024;

    // Allowed file extensions
    private static readonly string[] AllowedExtensions = new[]
    {
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt",
        ".png", ".jpg", ".jpeg", ".gif", ".zip", ".rar"
    };

    public UploadAttachmentCommandValidator()
    {
        RuleFor(x => x.TaskId)
            .NotEmpty()
            .WithMessage("Task ID is required");

        RuleFor(x => x.FileName)
            .NotEmpty()
            .WithMessage("File name is required")
            .MaximumLength(255)
            .WithMessage("File name must not exceed 255 characters")
            .Must(BeValidFileName)
            .WithMessage("File name contains invalid characters");

        RuleFor(x => x.FileSize)
            .GreaterThan(0)
            .WithMessage("File size must be greater than 0")
            .LessThanOrEqualTo(MaxFileSize)
            .WithMessage($"File size must not exceed {MaxFileSize / 1024 / 1024}MB");

        RuleFor(x => x.FileName)
            .Must(HaveAllowedExtension)
            .WithMessage($"File type is not allowed. Allowed types: {string.Join(", ", AllowedExtensions)}");

        RuleFor(x => x.ContentType)
            .NotEmpty()
            .WithMessage("Content type is required")
            .MaximumLength(200)
            .WithMessage("Content type must not exceed 200 characters");

        RuleFor(x => x.FileStream)
            .NotNull()
            .WithMessage("File stream is required");
    }

    private bool BeValidFileName(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            return false;

        // Check for invalid file name characters
        var invalidChars = Path.GetInvalidFileNameChars();
        return !fileName.Any(c => invalidChars.Contains(c));
    }

    private bool HaveAllowedExtension(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            return false;

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return AllowedExtensions.Contains(extension);
    }
}
