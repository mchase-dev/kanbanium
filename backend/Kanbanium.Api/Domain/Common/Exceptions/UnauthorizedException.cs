namespace Kanbanium.Domain.Common.Exceptions;

public class UnauthorizedException : ApiException
{
    public UnauthorizedException(string message)
        : base(message, StatusCodes.Status401Unauthorized)
    {
    }

    public UnauthorizedException()
        : base("Authentication failed. Invalid credentials.", StatusCodes.Status401Unauthorized)
    {
    }
}
