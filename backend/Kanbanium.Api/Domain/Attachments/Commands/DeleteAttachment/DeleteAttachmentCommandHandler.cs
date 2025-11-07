using Kanbanium.Data;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Kanbanium.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Attachments.Commands.DeleteAttachment;

public class DeleteAttachmentCommandHandler : IRequestHandler<DeleteAttachmentCommand, Result>
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<DeleteAttachmentCommandHandler> _logger;

    public DeleteAttachmentCommandHandler(
        ApplicationDbContext context,
        ICurrentUserService currentUserService,
        IFileStorageService fileStorageService,
        ILogger<DeleteAttachmentCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _fileStorageService = fileStorageService;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteAttachmentCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        // Get attachment with task and board information
        var attachment = await _context.Attachments
            .Include(a => a.Task)
                .ThenInclude(t => t.Board)
                    .ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (attachment == null)
        {
            throw new NotFoundException(nameof(Attachment), request.Id);
        }

        // Check board permissions
        var member = attachment.Task.Board.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null)
        {
            throw new ForbiddenException("You do not have access to this board");
        }

        // Users can only delete their own attachments unless they're an admin
        var isAdmin = member.Role == BoardRole.Admin;
        var isOwner = attachment.CreatedBy == userId;

        if (!isAdmin && !isOwner)
        {
            throw new ForbiddenException("You can only delete your own attachments");
        }

        // Delete file from storage
        try
        {
            await _fileStorageService.DeleteFileAsync(attachment.FilePath, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to delete file {FilePath} from storage", attachment.FilePath);
            // Continue with database deletion even if file deletion fails
        }

        // Delete from database
        _context.Attachments.Remove(attachment);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Attachment {AttachmentId} deleted by user {UserId}", request.Id, _currentUserService.UserId);

        return Result.Success();
    }
}
