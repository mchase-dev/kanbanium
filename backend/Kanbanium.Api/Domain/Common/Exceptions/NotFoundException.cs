namespace Kanbanium.Domain.Common.Exceptions;

public class NotFoundException : ApiException
{
    public NotFoundException(string message)
        : base(message, StatusCodes.Status404NotFound)
    {
    }

    public NotFoundException(string resourceName, object key)
        : base($"{resourceName} with identifier '{key}' was not found.", StatusCodes.Status404NotFound)
    {
    }
}
