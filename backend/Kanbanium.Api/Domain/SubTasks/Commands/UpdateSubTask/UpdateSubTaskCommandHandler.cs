using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.SubTasks.Commands.UpdateSubTask;

public class UpdateSubTaskCommandHandler : IRequestHandler<UpdateSubTaskCommand, Result<SubTaskDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UpdateSubTaskCommandHandler> _logger;

    public UpdateSubTaskCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<UpdateSubTaskCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<SubTaskDto>> Handle(UpdateSubTaskCommand request, CancellationToken cancellationToken)
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
            _logger.LogWarning("User {UserId} attempted to update subtask {SubTaskId} without board membership", userId, request.Id);
            throw new ForbiddenException("You do not have access to this board");
        }

        subTask.Title = request.Title;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} updated subtask {SubTaskId}", userId, request.Id);

        var subTaskDto = subTask.Adapt<SubTaskDto>();
        return Result<SubTaskDto>.Success(subTaskDto);
    }
}
