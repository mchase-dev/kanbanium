using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Tasks.Queries.GetTaskHistory;

public class GetTaskHistoryQueryHandler : IRequestHandler<GetTaskHistoryQuery, Result<List<TaskHistoryDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetTaskHistoryQueryHandler> _logger;

    public GetTaskHistoryQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<GetTaskHistoryQueryHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<List<TaskHistoryDto>>> Handle(GetTaskHistoryQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        // Get the task to verify it exists and user has access
        var task = await _context.TaskItems
            .Include(t => t.Board)
                .ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
        {
            throw new NotFoundException(nameof(TaskItem), request.TaskId);
        }

        // Verify user is a member of the board
        var isMember = task.Board.Members.Any(m => m.UserId == userId);
        if (!isMember)
        {
            _logger.LogWarning("User {UserId} attempted to view history for task {TaskId} without board membership", userId, request.TaskId);
            throw new ForbiddenException("You do not have access to this board");
        }

        // Get task history ordered by most recent first
        var history = await _context.TaskHistories
            .Include(h => h.User)
            .Where(h => h.TaskId == request.TaskId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync(cancellationToken);

        var historyDtos = history.Adapt<List<TaskHistoryDto>>();

        return Result<List<TaskHistoryDto>>.Success(historyDtos);
    }
}
