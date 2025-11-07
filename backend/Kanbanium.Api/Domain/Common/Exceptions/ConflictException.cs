namespace Kanbanium.Domain.Common.Exceptions;

public class ConflictException : ApiException
{
    public ConflictException(string message)
        : base(message, StatusCodes.Status409Conflict)
    {
    }

    public ConflictException(string message, Exception innerException)
        : base(message, StatusCodes.Status409Conflict, innerException)
    {
    }
}
