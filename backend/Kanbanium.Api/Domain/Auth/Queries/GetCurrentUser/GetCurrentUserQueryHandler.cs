using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Kanbanium.Data.Entities;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Kanbanium.Domain.Auth.Queries.GetCurrentUser;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, Result<UserDto>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly UserManager<ApplicationUser> _userManager;

    public GetCurrentUserQueryHandler(
        ICurrentUserService currentUserService,
        UserManager<ApplicationUser> userManager)
    {
        _currentUserService = currentUserService;
        _userManager = userManager;
    }

    public async Task<Result<UserDto>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated || string.IsNullOrEmpty(_currentUserService.UserId))
        {
            return Result<UserDto>.Failure("User is not authenticated");
        }

        var user = await _userManager.FindByIdAsync(_currentUserService.UserId);

        if (user == null)
        {
            return Result<UserDto>.Failure("User not found");
        }

        var userDto = user.Adapt<UserDto>();

        // Get user role
        var roles = await _userManager.GetRolesAsync(user);
        userDto.Role = roles.FirstOrDefault();
        userDto.IsDeleted = user.DeletedAt.HasValue;

        return Result<UserDto>.Success(userDto);
    }
}
