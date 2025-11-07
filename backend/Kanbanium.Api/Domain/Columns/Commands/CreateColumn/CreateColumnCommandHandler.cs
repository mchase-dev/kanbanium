using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Columns.Commands.CreateColumn;

public class CreateColumnCommandHandler : IRequestHandler<CreateColumnCommand, Result<BoardColumnDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CreateColumnCommandHandler> _logger;

    public CreateColumnCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<CreateColumnCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<BoardColumnDto>> Handle(CreateColumnCommand request, CancellationToken cancellationToken)
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

        // Verify user is a member with admin rights
        var member = board.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null)
        {
            throw new ForbiddenException("You do not have access to this board");
        }

        if (member.Role != BoardRole.Admin)
        {
            _logger.LogWarning("User {UserId} attempted to create column on board {BoardId} without admin rights", userId, request.BoardId);
            throw new ForbiddenException("Only board admins can create columns");
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

        // Calculate next position
        var maxPosition = board.Columns.Any() ? board.Columns.Max(c => c.Position) : -1;

        var column = new BoardColumn
        {
            BoardId = request.BoardId,
            Name = request.Name,
            Position = maxPosition + 1,
            StatusId = request.StatusId,
            WipLimit = request.WipLimit
        };

        _context.BoardColumns.Add(column);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} created column {ColumnId} on board {BoardId}", userId, column.Id, request.BoardId);

        // Load status for DTO mapping
        if (column.StatusId.HasValue)
        {
            column.Status = await _context.Statuses.FindAsync(new object[] { column.StatusId.Value }, cancellationToken);
        }

        var columnDto = column.Adapt<BoardColumnDto>();
        return Result<BoardColumnDto>.Success(columnDto);
    }
}
