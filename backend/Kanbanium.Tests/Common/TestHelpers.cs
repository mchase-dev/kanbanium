using Microsoft.Extensions.Logging;
using Moq;

namespace Kanbanium.Tests.Common;

public static class TestHelpers
{
    public static Mock<ILogger<T>> CreateMockLogger<T>()
    {
        return new Mock<ILogger<T>>();
    }

    public static ILogger<T> CreateLogger<T>()
    {
        return CreateMockLogger<T>().Object;
    }
}
