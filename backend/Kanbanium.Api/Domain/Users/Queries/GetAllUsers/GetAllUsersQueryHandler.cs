using Kanbanium.Data.Entities;
using Kanbanium.Domain.Common.Exceptions;
using Kanbanium.Domain.Common.Interfaces;
using Kanbanium.DTOs;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Domain.Users.Queries.GetAllUsers;

public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, Result<PaginatedList<UserDto>>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetAllUsersQueryHandler> _logger;

    public GetAllUsersQueryHandler(
        UserManager<ApplicationUser> userManager,
        ICurrentUserService currentUserService,
        ILogger<GetAllUsersQueryHandler> logger)
    {
        _userManager = userManager;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<PaginatedList<UserDto>>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedException();
        }

        // Verify current user is a Superuser
        var currentUser = await _userManager.FindByIdAsync(userId);
        if (currentUser == null)
        {
            throw new UnauthorizedException();
        }

        var roles = await _userManager.GetRolesAsync(currentUser);
        if (!roles.Contains("Superuser"))
        {
            _logger.LogWarning("User {UserId} attempted to access user management without Superuser role", userId);
            throw new ForbiddenException("Only superusers can manage users");
        }

        // Build query
        IQueryable<ApplicationUser> query = _userManager.Users;

        // Filter by deleted status
        if (request.IncludeDeleted == false)
        {
            query = query.Where(u => u.DeletedAt == null);
        }

        // Filter by search term
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(u =>
                u.UserName!.ToLower().Contains(searchTerm) ||
                u.Email!.ToLower().Contains(searchTerm) ||
                u.FirstName.ToLower().Contains(searchTerm) ||
                u.LastName.ToLower().Contains(searchTerm));
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var users = await query
            .OrderBy(u => u.UserName)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        // Map to DTOs and add roles
        var userDtos = new List<UserDto>();
        foreach (var user in users)
        {
            var dto = user.Adapt<UserDto>();
            var userRoles = await _userManager.GetRolesAsync(user);
            dto.Role = userRoles.FirstOrDefault(); // Assuming users have one role
            dto.IsDeleted = user.DeletedAt.HasValue;
            userDtos.Add(dto);
        }

        // Filter by role if specified (after fetching roles from Identity)
        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            userDtos = userDtos.Where(u => u.Role == request.Role).ToList();
            totalCount = userDtos.Count;
        }

        var paginatedList = new PaginatedList<UserDto>(
            userDtos,
            totalCount,
            request.Page,
            request.PageSize
        );

        return Result<PaginatedList<UserDto>>.Success(paginatedList);
    }
}
