namespace Kanbanium.Domain.Common.Exceptions;

public class BadRequestException : ApiException
{
    public BadRequestException(string message)
        : base(message, StatusCodes.Status400BadRequest)
    {
    }

    public BadRequestException(string message, Exception innerException)
        : base(message, StatusCodes.Status400BadRequest, innerException)
    {
    }
}
