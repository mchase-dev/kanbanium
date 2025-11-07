using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Columns.Commands.DeleteColumn;

public class DeleteColumnCommandHandler : IRequestHandler<DeleteColumnCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<DeleteColumnCommandHandler> _logger;

    public DeleteColumnCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<DeleteColumnCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteColumnCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var column = await _context.BoardColumns
            .Include(c => c.Board)
                .ThenInclude(b => b.Members)
            .Include(c => c.Tasks)
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
            _logger.LogWarning("User {UserId} attempted to delete column {ColumnId} without admin rights", userId, request.Id);
            throw new ForbiddenException("Only board admins can delete columns");
        }

        // Prevent deleting columns with tasks
        if (column.Tasks.Any())
        {
            throw new BadRequestException("Cannot delete a column that contains tasks. Move or delete the tasks first.");
        }

        _context.BoardColumns.Remove(column);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} deleted column {ColumnId}", userId, request.Id);

        return Result.Success();
    }
}
