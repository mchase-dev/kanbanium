using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Tasks.Commands.AssignTask;

public class AssignTaskCommandHandler : IRequestHandler<AssignTaskCommand, Result<TaskDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AssignTaskCommandHandler> _logger;

    public AssignTaskCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<AssignTaskCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<TaskDto>> Handle(AssignTaskCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var task = await _context.TaskItems
            .Include(t => t.Board)
                .ThenInclude(b => b.Members)
            .Include(t => t.Status)
            .Include(t => t.Type)
            .Include(t => t.Assignee)
            .Include(t => t.Labels)
                .ThenInclude(tl => tl.Label)
            .Include(t => t.SubTasks)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException(nameof(TaskItem), request.Id);
        }

        // Verify user is a member
        var isMember = task.Board.Members.Any(m => m.UserId == userId);
        if (!isMember)
        {
            _logger.LogWarning("User {UserId} attempted to assign task {TaskId} without board membership", userId, request.Id);
            throw new ForbiddenException("You do not have access to this board");
        }

        // If assigning to someone, verify they are a board member
        if (!string.IsNullOrEmpty(request.AssigneeId))
        {
            var assigneeIsMember = task.Board.Members.Any(m => m.UserId == request.AssigneeId);
            if (!assigneeIsMember)
            {
                throw new BadRequestException("Assignee must be a member of the board");
            }

            // Verify assignee exists
            var assignee = await _context.Users.FindAsync(new object[] { request.AssigneeId }, cancellationToken);
            if (assignee == null)
            {
                throw new NotFoundException(nameof(ApplicationUser), request.AssigneeId);
            }
        }

        var oldAssigneeId = task.AssigneeId;
        task.AssigneeId = request.AssigneeId;

        await _context.SaveChangesAsync(cancellationToken);

        if (string.IsNullOrEmpty(request.AssigneeId))
        {
            _logger.LogInformation("User {UserId} unassigned task {TaskId}", userId, request.Id);
        }
        else
        {
            _logger.LogInformation("User {UserId} assigned task {TaskId} to {AssigneeId}", userId, request.Id, request.AssigneeId);
        }

        var taskDto = task.Adapt<TaskDto>();
        taskDto.CommentCount = await _context.Comments.CountAsync(c => c.TaskId == task.Id, cancellationToken);
        taskDto.AttachmentCount = await _context.Attachments.CountAsync(a => a.TaskId == task.Id, cancellationToken);

        return Result<TaskDto>.Success(taskDto);
    }
}
