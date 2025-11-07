namespace Kanbanium.Domain.Common.Exceptions;

public class ForbiddenException : ApiException
{
    public ForbiddenException(string message)
        : base(message, StatusCodes.Status403Forbidden)
    {
    }

    public ForbiddenException()
        : base("You do not have permission to access this resource.", StatusCodes.Status403Forbidden)
    {
    }
}
