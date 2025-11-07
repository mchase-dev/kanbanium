using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Columns.Commands.UpdateColumn;

public class UpdateColumnCommandHandler : IRequestHandler<UpdateColumnCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UpdateColumnCommandHandler> _logger;

    public UpdateColumnCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<UpdateColumnCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(UpdateColumnCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var column = await _context.BoardColumns
            .Include(c => c.Board)
                .ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (column == null)
        {
            throw new NotFoundException(nameof(BoardColumn), request.Id);
        }

        // Verify user is an admin
        var member = column.Board.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null)
        {
            throw new ForbiddenException("You do not have access to this board");
        }

        if (member.Role != BoardRole.Admin)
        {
            _logger.LogWarning("User {UserId} attempted to update column {ColumnId} without admin rights", userId, request.Id);
            throw new ForbiddenException("Only board admins can update columns");
        }

        // Verify status exists if provided
        if (request.StatusId.HasValue)
        {
            var statusExists = await _context.Statuses.AnyAsync(s => s.Id == request.StatusId.Value, cancellationToken);
            if (!statusExists)
            {
                throw new NotFoundException("Status", request.StatusId.Value);
            }
        }

        column.Name = request.Name;
        column.StatusId = request.StatusId;
        column.WipLimit = request.WipLimit;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} updated column {ColumnId}", userId, request.Id);

        return Result.Success();
    }
}
