using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Kanbanium.Services;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Comments.Commands.CreateComment;

public class CreateCommentCommandHandler : IRequestHandler<CreateCommentCommand, Result<CommentDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly INotificationService _notificationService;
    private readonly IMentionService _mentionService;
    private readonly ILogger<CreateCommentCommandHandler> _logger;

    public CreateCommentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        INotificationService notificationService,
        IMentionService mentionService,
        ILogger<CreateCommentCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _notificationService = notificationService;
        _mentionService = mentionService;
        _logger = logger;
    }

    public async Task<Result<CommentDto>> Handle(CreateCommentCommand request, CancellationToken cancellationToken)
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
            _logger.LogWarning("User {UserId} attempted to comment on task {TaskId} without board membership", userId, request.TaskId);
            throw new ForbiddenException("You do not have access to this board");
        }

        var comment = new Comment
        {
            TaskId = request.TaskId,
            UserId = userId,
            Content = request.Content
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} created comment {CommentId} on task {TaskId}", userId, comment.Id, request.TaskId);

        // Parse and notify mentioned users
        var mentionedUserIds = await _mentionService.ParseMentionsAsync(request.Content);
        if (mentionedUserIds.Any())
        {
            _logger.LogInformation("Found {Count} mentions in comment {CommentId}", mentionedUserIds.Count, comment.Id);

            // Send notification to each mentioned user (exclude the commenter)
            foreach (var mentionedUserId in mentionedUserIds.Where(id => id != userId))
            {
                await _notificationService.UserMentioned(
                    mentionedUserId,
                    task.BoardId.ToString(),
                    request.TaskId.ToString(),
                    comment.Id.ToString(),
                    userId);
            }
        }

        // Reload with user info
        var createdComment = await _context.Comments
            .Include(c => c.User)
            .FirstAsync(c => c.Id == comment.Id, cancellationToken);

        var commentDto = createdComment.Adapt<CommentDto>();
        return Result<CommentDto>.Success(commentDto);
    }
}
