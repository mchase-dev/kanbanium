using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.SubTasks.Commands.ToggleSubTask;

public class ToggleSubTaskCommandHandler : IRequestHandler<ToggleSubTaskCommand, Result<SubTaskDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ToggleSubTaskCommandHandler> _logger;

    public ToggleSubTaskCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<ToggleSubTaskCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<SubTaskDto>> Handle(ToggleSubTaskCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var subTask = await _context.SubTasks
            .Include(st => st.Task)
                .ThenInclude(t => t.Board)
                    .ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(st => st.Id == request.Id, cancellationToken);

        if (subTask == null)
        {
            throw new NotFoundException(nameof(SubTask), request.Id);
        }

        // Verify user is a board member
        var isMember = subTask.Task.Board.Members.Any(m => m.UserId == userId);
        if (!isMember)
        {
            _logger.LogWarning("User {UserId} attempted to toggle subtask {SubTaskId} without board membership", userId, request.Id);
            throw new ForbiddenException("You do not have access to this board");
        }

        subTask.IsCompleted = !subTask.IsCompleted;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} toggled subtask {SubTaskId} to {IsCompleted}", userId, request.Id, subTask.IsCompleted);

        var subTaskDto = subTask.Adapt<SubTaskDto>();
        return Result<SubTaskDto>.Success(subTaskDto);
    }
}
