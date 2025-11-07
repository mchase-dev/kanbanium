using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.ReferenceData.Queries.GetTaskTypes;

public class GetTaskTypesQueryHandler : IRequestHandler<GetTaskTypesQuery, Result<List<TaskTypeDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetTaskTypesQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<List<TaskTypeDto>>> Handle(GetTaskTypesQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        var taskTypes = await _context.TaskTypes
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);

        var taskTypeDtos = taskTypes.Adapt<List<TaskTypeDto>>();
        return Result<List<TaskTypeDto>>.Success(taskTypeDtos);
    }
}
