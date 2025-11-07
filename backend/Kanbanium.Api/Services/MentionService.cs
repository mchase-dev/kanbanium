using System.Text.RegularExpressions;
using Kanbanium.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Kanbanium.Services;

public interface IMentionService
{
    Task<List<string>> ParseMentionsAsync(string content);
}

public class MentionService : IMentionService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<MentionService> _logger;

    // Regex to match @username (letters, numbers, underscores, hyphens)
    private static readonly Regex MentionRegex = new(@"@([a-zA-Z0-9_-]+)", RegexOptions.Compiled);

    public MentionService(
        UserManager<ApplicationUser> userManager,
        ILogger<MentionService> logger)
    {
        _userManager = userManager;
        _logger = logger;
    }

    /// <summary>
    /// Parse @mentions from text and return list of valid user IDs
    /// </summary>
    public async Task<List<string>> ParseMentionsAsync(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return new List<string>();
        }

        var matches = MentionRegex.Matches(content);
        if (matches.Count == 0)
        {
            return new List<string>();
        }

        var usernames = matches
            .Select(m => m.Groups[1].Value)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        _logger.LogDebug("Found {Count} potential mentions: {Usernames}",
            usernames.Count, string.Join(", ", usernames));

        // Validate usernames and get user IDs
        var userIds = new List<string>();

        foreach (var username in usernames)
        {
            var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.UserName == username);

            if (user != null)
            {
                userIds.Add(user.Id);
                _logger.LogDebug("Valid mention found: @{Username} (ID: {UserId})", username, user.Id);
            }
            else
            {
                _logger.LogDebug("Invalid mention (user not found): @{Username}", username);
            }
        }

        return userIds;
    }
}
