using System.Text.RegularExpressions;
using Property.Api.Models;

namespace Property.Api.Services;

/// <summary>
/// Provides a static method to normalize an external property payload
/// into the internal format required by the system.
/// </summary>
public static class PropertyNormalizer
{
    // Precompiled regex: collapse multiple whitespace characters into a single space
    private static readonly Regex Spaces = new(@"\s+", RegexOptions.Compiled);

    /// <summary>
    /// Normalizes an ExternalProperty into an InternalProperty.
    /// - Prefer FormattedAddress if provided, otherwise build from AddressParts.
    /// - Collapse redundant whitespace.
    /// - Normalize empty volume/folio values to null.
    /// - Determine status based on presence of both volume and folio.
    /// - Carry forward source trace metadata.
    /// </summary>
    public static InternalProperty NormalizeProperty(ExternalProperty p)
    {
        // Prefer formattedAddress if available; otherwise build from address parts
        var fullAddress = !string.IsNullOrWhiteSpace(p.FormattedAddress)
            ? p.FormattedAddress!.Trim()
            : BuildAddress(p.AddressParts);

        // Normalize whitespace and trim leading/trailing spaces
        fullAddress = Spaces.Replace(fullAddress ?? string.Empty, " ").Trim();

        // Normalize volume/folio: treat empty/whitespace as null
        var volume = NormalizeEmptyToNull(p.Title?.Volume);
        var folio  = NormalizeEmptyToNull(p.Title?.Folio);

        // Determine status: KnownVolFol only if both values are present
        var known  = !string.IsNullOrEmpty(volume) && !string.IsNullOrEmpty(folio);
        var status = known ? InternalProperty.Statuses.KnownVolFol
                           : InternalProperty.Statuses.UnknownVolFol;

        // Ensure receivedAt is formatted in ISO 8601 (UTC)
        var receivedAt = p.ReceivedAt?.UtcDateTime.ToString("yyyy-MM-ddTHH:mm:ssZ");
        var trace = new SourceTrace(p.Provider, p.RequestId, receivedAt);

        // Return normalized internal property object
        return new InternalProperty(
            FullAddress: fullAddress ?? string.Empty,
            LotPlan: p.LotPlan,
            VolumeFolio: new VolumeFolio(volume, folio),
            Status: status,
            SourceTrace: trace
        );
    }

    /// <summary>
    /// Converts empty or whitespace-only strings to null.
    /// Ensures cleaner volume/folio values.
    /// </summary>
    private static string? NormalizeEmptyToNull(string? s)
        => string.IsNullOrWhiteSpace(s) ? null : s.Trim();

    /// <summary>
    /// Builds an address string from address parts:
    /// "Street, Suburb State Postcode"
    /// - Cleans each part by trimming spaces and trailing commas.
    /// - Joins suburb, state, postcode with spaces.
    /// - Joins street with right-hand side using ", ".
    /// </summary>
    private static string BuildAddress(AddressParts? a)
    {
        if (a is null) return string.Empty;

        static string Clean(string? s) => (s ?? string.Empty).Trim().TrimEnd(',');

        var street   = Clean(a.Street);
        var suburb   = Clean(a.Suburb);
        var state    = Clean(a.State);
        var postcode = Clean(a.Postcode);

        // Build right-hand side (Suburb State Postcode)
        var right = string.Join(" ",
            new[] { suburb, state, postcode }
                .Where(x => !string.IsNullOrWhiteSpace(x)));

        // Combine street and right-hand side
        var parts = new List<string>();
        if (!string.IsNullOrWhiteSpace(street)) parts.Add(street);
        if (!string.IsNullOrWhiteSpace(right))  parts.Add(right);

        return string.Join(", ", parts);
    }
}
