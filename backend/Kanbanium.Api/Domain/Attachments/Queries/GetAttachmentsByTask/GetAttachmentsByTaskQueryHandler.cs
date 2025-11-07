using Kanbanium.Data;
using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Attachments.Queries.GetAttachmentsByTask;

public class GetAttachmentsByTaskQueryHandler : IRequestHandler<GetAttachmentsByTaskQuery, Result<List<AttachmentDto>>>
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetAttachmentsByTaskQueryHandler(
        ApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<List<AttachmentDto>>> Handle(GetAttachmentsByTaskQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        // Get task and check if it exists
        var task = await _context.Tasks
            .AsNoTracking()
            .Include(t => t.Board)
                .ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException(nameof(TaskItem), request.TaskId);
        }

        // Check board permissions (viewer can see attachments)
        var member = task.Board.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null)
        {
            throw new ForbiddenException("You do not have access to this board");
        }

        // Get attachments
        var attachments = await _context.Attachments
            .AsNoTracking()
            .Where(a => a.TaskId == request.TaskId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AttachmentDto
            {
                Id = a.Id,
                TaskId = a.TaskId,
                FileName = a.FileName,
                FilePath = a.FilePath,
                FileSize = a.FileSize,
                ContentType = a.ContentType,
                UploadedBy = a.CreatedBy,
                UploadedAt = a.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<List<AttachmentDto>>.Success(attachments);
    }
}
