using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Comments.Commands.UpdateComment;

public class UpdateCommentCommandHandler : IRequestHandler<UpdateCommentCommand, Result<CommentDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UpdateCommentCommandHandler> _logger;

    public UpdateCommentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<UpdateCommentCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<CommentDto>> Handle(UpdateCommentCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var comment = await _context.Comments
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (comment == null)
        {
            throw new NotFoundException(nameof(Comment), request.Id);
        }

        // Only the comment author can update it
        if (comment.UserId != userId)
        {
            _logger.LogWarning("User {UserId} attempted to update comment {CommentId} created by {AuthorId}", userId, request.Id, comment.UserId);
            throw new ForbiddenException("You can only update your own comments");
        }

        comment.Content = request.Content;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} updated comment {CommentId}", userId, request.Id);

        var commentDto = comment.Adapt<CommentDto>();
        return Result<CommentDto>.Success(commentDto);
    }
}
