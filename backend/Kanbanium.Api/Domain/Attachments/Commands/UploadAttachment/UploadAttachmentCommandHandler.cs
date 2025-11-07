using Kanbanium.Data;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Kanbanium.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Attachments.Commands.UploadAttachment;

public class UploadAttachmentCommandHandler : IRequestHandler<UploadAttachmentCommand, Result<AttachmentDto>>
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<UploadAttachmentCommandHandler> _logger;

    // Max file size: 10MB
    private const long MaxFileSize = 10 * 1024 * 1024;

    // Allowed file extensions
    private static readonly string[] AllowedExtensions = new[]
    {
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt",
        ".png", ".jpg", ".jpeg", ".gif", ".zip", ".rar"
    };

    public UploadAttachmentCommandHandler(
        ApplicationDbContext context,
        ICurrentUserService currentUserService,
        IFileStorageService fileStorageService,
        ILogger<UploadAttachmentCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _fileStorageService = fileStorageService;
        _logger = logger;
    }

    public async Task<Result<AttachmentDto>> Handle(UploadAttachmentCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        // Validate file size
        if (request.FileSize > MaxFileSize)
        {
            throw new BadRequestException($"File size exceeds maximum allowed size of {MaxFileSize / 1024 / 1024}MB");
        }

        // Validate file extension
        var extension = Path.GetExtension(request.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            throw new BadRequestException($"File type '{extension}' is not allowed. Allowed types: {string.Join(", ", AllowedExtensions)}");
        }

        // Get task and check if it exists
        var task = await _context.Tasks
            .Include(t => t.Board)
                .ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException(nameof(TaskItem), request.TaskId);
        }

        // Check board permissions (user must be at least a member)
        var member = task.Board.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null)
        {
            throw new ForbiddenException("You do not have access to this board");
        }

        if (member.Role == BoardRole.Viewer)
        {
            throw new ForbiddenException("Viewers cannot upload attachments");
        }

        // Save file to storage
        var filePath = await _fileStorageService.SaveFileAsync(
            request.FileStream,
            request.FileName,
            request.ContentType,
            cancellationToken);

        // Create attachment entity
        var attachment = new Attachment
        {
            Id = Guid.NewGuid(),
            TaskId = request.TaskId,
            FileName = request.FileName,
            FilePath = filePath,
            ContentType = request.ContentType,
            FileSize = request.FileSize,
            CreatedBy = _currentUserService.UserId!,
            CreatedAt = DateTime.UtcNow
        };

        _context.Attachments.Add(attachment);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} uploaded attachment {AttachmentId} for task {TaskId}", userId, attachment.Id, request.TaskId);

        var dto = new AttachmentDto
        {
            Id = attachment.Id,
            TaskId = attachment.TaskId,
            FileName = attachment.FileName,
            FilePath = attachment.FilePath,
            FileSize = attachment.FileSize,
            ContentType = attachment.ContentType,
            UploadedBy = attachment.CreatedBy,
            UploadedAt = attachment.CreatedAt
        };

        return Result<AttachmentDto>.Success(dto);
    }
}
