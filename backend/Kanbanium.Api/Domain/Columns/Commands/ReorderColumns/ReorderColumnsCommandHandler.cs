using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Columns.Commands.ReorderColumns;

public class ReorderColumnsCommandHandler : IRequestHandler<ReorderColumnsCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ReorderColumnsCommandHandler> _logger;

    public ReorderColumnsCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<ReorderColumnsCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result> Handle(ReorderColumnsCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var board = await _context.Boards
            .Include(b => b.Members)
            .Include(b => b.Columns)
            .FirstOrDefaultAsync(b => b.Id == request.BoardId, cancellationToken);

        if (board == null)
        {
            throw new NotFoundException(nameof(Board), request.BoardId);
        }

        // Verify user is a member (any member can reorder columns)
        var member = board.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null)
        {
            throw new ForbiddenException("You do not have access to this board");
        }

        // Verify all column IDs belong to this board
        var columnIds = request.Columns.Select(c => c.Id).ToList();
        var invalidColumns = columnIds.Except(board.Columns.Select(c => c.Id)).ToList();
        if (invalidColumns.Any())
        {
            throw new BadRequestException("One or more column IDs do not belong to this board");
        }

        // Update positions
        foreach (var columnPosition in request.Columns)
        {
            var column = board.Columns.First(c => c.Id == columnPosition.Id);
            column.Position = columnPosition.Position;
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} reordered columns on board {BoardId}", userId, request.BoardId);

        return Result.Success();
    }
}
