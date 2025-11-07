using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.ReferenceData.Queries.GetStatuses;

public class GetStatusesQueryHandler : IRequestHandler<GetStatusesQuery, Result<List<StatusDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetStatusesQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<List<StatusDto>>> Handle(GetStatusesQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var statuses = await _context.Statuses
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);

        var statusDtos = statuses.Adapt<List<StatusDto>>();
        return Result<List<StatusDto>>.Success(statusDtos);
    }
}
