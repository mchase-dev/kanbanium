using Kanbanium.Domain.Auth.Commands.Login;
using MediatR;

namespace Kanbanium.Domain.Auth.Commands.Register;

public class RegisterCommand : IRequest<LoginResponse>
{
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}
