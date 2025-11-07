using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Comments.Commands.DeleteComment;

public class DeleteCommentCommandHandler : IRequestHandler<DeleteCommentCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<DeleteCommentCommandHandler> _logger;

    public DeleteCommentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<DeleteCommentCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteCommentCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var comment = await _context.Comments
            .Include(c => c.Task)
                .ThenInclude(t => t.Board)
                    .ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (comment == null)
        {
            throw new NotFoundException(nameof(Comment), request.Id);
        }

        // User can delete their own comment, or board admins can delete any comment
        var member = comment.Task.Board.Members.FirstOrDefault(m => m.UserId == userId);
        if (comment.UserId != userId && (member == null || member.Role != BoardRole.Admin))
        {
            _logger.LogWarning("User {UserId} attempted to delete comment {CommentId} without permission", userId, request.Id);
            throw new ForbiddenException("You can only delete your own comments");
        }

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} deleted comment {CommentId}", userId, request.Id);

        return Result.Success();
    }
}
