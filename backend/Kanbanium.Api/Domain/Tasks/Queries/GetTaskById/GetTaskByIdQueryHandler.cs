using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Tasks.Queries.GetTaskById;

public class GetTaskByIdQueryHandler : IRequestHandler<GetTaskByIdQuery, Result<TaskDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetTaskByIdQueryHandler> _logger;

    public GetTaskByIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<GetTaskByIdQueryHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<TaskDto>> Handle(GetTaskByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var task = await _context.TaskItems
            .Include(t => t.Status)
            .Include(t => t.Type)
            .Include(t => t.Assignee)
            .Include(t => t.Labels)
                .ThenInclude(tl => tl.Label)
            .Include(t => t.SubTasks)
            .Include(t => t.Watchers)
                .ThenInclude(w => w.User)
            .Include(t => t.Board)
                .ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException(nameof(TaskItem), request.Id);
        }

        // Verify user is a member
        var isMember = task.Board.Members.Any(m => m.UserId == userId);
        if (!isMember)
        {
            _logger.LogWarning("User {UserId} attempted to view task {TaskId} without board membership", userId, request.Id);
            throw new ForbiddenException("You do not have access to this board");
        }

        var taskDto = task.Adapt<TaskDto>();
        taskDto.CommentCount = await _context.Comments.CountAsync(c => c.TaskId == task.Id, cancellationToken);
        taskDto.AttachmentCount = await _context.Attachments.CountAsync(a => a.TaskId == task.Id, cancellationToken);

        return Result<TaskDto>.Success(taskDto);
    }
}
