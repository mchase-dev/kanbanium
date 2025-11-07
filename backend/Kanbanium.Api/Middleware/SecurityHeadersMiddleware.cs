namespace Kanbanium.Middleware;

/// <summary>
/// Middleware to add security headers to all responses
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // X-Content-Type-Options: Prevents MIME type sniffing
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");

        // X-Frame-Options: Prevents clickjacking attacks
        context.Response.Headers.Append("X-Frame-Options", "DENY");

        // X-XSS-Protection: Enables XSS filter in older browsers
        context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");

        // Referrer-Policy: Controls referrer information
        context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

        // Permissions-Policy: Controls browser features
        context.Response.Headers.Append("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

        // Content-Security-Policy: Prevents XSS, injection attacks
        // Note: This is a restrictive policy. Adjust based on your needs.
        var csp = "default-src 'self'; " +
                  "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +  // Allow inline scripts for development
                  "style-src 'self' 'unsafe-inline'; " +                  // Allow inline styles
                  "img-src 'self' data: https:; " +                        // Allow images from self, data URLs, and HTTPS
                  "font-src 'self' data:; " +                              // Allow fonts from self and data URLs
                  "connect-src 'self' ws: wss:; " +                        // Allow WebSocket connections
                  "frame-ancestors 'none'; " +                             // Same as X-Frame-Options: DENY
                  "base-uri 'self'; " +                                    // Restrict base tag
                  "form-action 'self'";                                    // Restrict form submissions

        context.Response.Headers.Append("Content-Security-Policy", csp);

        // Strict-Transport-Security (HSTS): Forces HTTPS
        // Only add in production and when using HTTPS
        if (!context.Request.IsHttps)
        {
            // In development, we might not use HTTPS
            // In production, always use HTTPS and add HSTS header
        }
        else
        {
            // max-age=31536000 (1 year), includeSubDomains, preload
            context.Response.Headers.Append("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
        }

        await _next(context);
    }
}
