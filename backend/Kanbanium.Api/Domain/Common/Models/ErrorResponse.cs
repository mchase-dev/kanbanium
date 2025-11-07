namespace Kanbanium.Domain.Common.Models;

public class ErrorResponse
{
    public bool Success { get; set; }
    public string Error { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public string Timestamp { get; set; } = DateTime.UtcNow.ToString("o");

    public ErrorResponse(string error, int statusCode)
    {
        Success = false;
        Error = error;
        StatusCode = statusCode;
    }
}
