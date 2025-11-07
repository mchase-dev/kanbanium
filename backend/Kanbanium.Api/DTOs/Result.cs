namespace Kanbanium.DTOs;

public class Result
{
    public bool IsSuccess { get; set; }
    public string[] Errors { get; set; } = Array.Empty<string>();

    public static Result Success() => new() { IsSuccess = true };

    public static Result Failure(params string[] errors) => new() { IsSuccess = false, Errors = errors };
}

public class Result<T>
{
    public bool IsSuccess { get; set; }
    public T? Data { get; set; }
    public string[] Errors { get; set; } = Array.Empty<string>();

    public static Result<T> Success(T data) => new() { IsSuccess = true, Data = data };

    public static Result<T> Failure(params string[] errors) => new() { IsSuccess = false, Errors = errors };
}
