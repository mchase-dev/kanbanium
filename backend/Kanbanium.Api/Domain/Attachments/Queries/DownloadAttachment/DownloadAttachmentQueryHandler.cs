using Kanbanium.Data;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Attachments.Queries.DownloadAttachment;

public class DownloadAttachmentQueryHandler : IRequestHandler<DownloadAttachmentQuery, (Stream Stream, string FileName, string ContentType)>
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IFileStorageService _fileStorageService;

    public DownloadAttachmentQueryHandler(
        ApplicationDbContext context,
        ICurrentUserService currentUserService,
        IFileStorageService fileStorageService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _fileStorageService = fileStorageService;
    }

    public async Task<(Stream Stream, string FileName, string ContentType)> Handle(DownloadAttachmentQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        // Get attachment with task information
        var attachment = await _context.Attachments
            .AsNoTracking()
            .Include(a => a.Task)
                .ThenInclude(t => t.Board)
                    .ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (attachment == null)
        {
            throw new NotFoundException(nameof(Attachment), request.Id);
        }

        // Check board permissions (viewer can download attachments)
        var member = attachment.Task.Board.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null)
        {
            throw new ForbiddenException("You do not have access to this board");
        }

        // Get file from storage
        var (stream, contentType) = await _fileStorageService.GetFileAsync(attachment.FilePath, cancellationToken);

        return (stream, attachment.FileName, contentType);
    }
}
