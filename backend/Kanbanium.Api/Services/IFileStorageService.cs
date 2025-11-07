namespace Kanbanium.Services;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default);
    Task DeleteFileAsync(string filePath, CancellationToken cancellationToken = default);
    Task<(Stream Stream, string ContentType)> GetFileAsync(string filePath, CancellationToken cancellationToken = default);
    bool FileExists(string filePath);
}
