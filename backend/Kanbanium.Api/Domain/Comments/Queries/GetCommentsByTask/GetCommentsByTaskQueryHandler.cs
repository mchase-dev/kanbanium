using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Comments.Queries.GetCommentsByTask;

public class GetCommentsByTaskQueryHandler : IRequestHandler<GetCommentsByTaskQuery, Result<List<CommentDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetCommentsByTaskQueryHandler> _logger;

    public GetCommentsByTaskQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<GetCommentsByTaskQueryHandler> _logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        this._logger = _logger;
    }

    public async Task<Result<List<CommentDto>>> Handle(GetCommentsByTaskQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var task = await _context.TaskItems
            .Include(t => t.Board)
                .ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException(nameof(TaskItem), request.TaskId);
        }

        // Verify user is a board member
        var isMember = task.Board.Members.Any(m => m.UserId == userId);
        if (!isMember)
        {
            _logger.LogWarning("User {UserId} attempted to view comments for task {TaskId} without board membership", userId, request.TaskId);
            throw new ForbiddenException("You do not have access to this board");
        }

        var comments = await _context.Comments
            .Include(c => c.User)
            .Where(c => c.TaskId == request.TaskId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

        var commentDtos = comments.Adapt<List<CommentDto>>();
        return Result<List<CommentDto>>.Success(commentDtos);
    }
}
