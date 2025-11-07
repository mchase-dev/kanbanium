using Kanbanium.Domain.Auth.Commands.Login;
using MediatR;

namespace Kanbanium.Domain.Auth.Commands.RefreshToken;

public class RefreshTokenCommand : IRequest<LoginResponse>
{
    public string RefreshToken { get; set; } = string.Empty;
}
