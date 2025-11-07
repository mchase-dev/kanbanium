using Kanbanium.DTOs;
using MediatR;

namespace Kanbanium.Domain.Auth.Commands.UpdateProfile;

public class UpdateProfileCommand : IRequest<Result<UserDto>>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
