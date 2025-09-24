namespace Property.Api.Models;

public record VolumeFolio(string? Volume, string? Folio);
public record SourceTrace(string? Provider, string? RequestId, string? ReceivedAt);

public record InternalProperty(
    string FullAddress,
    LotPlan? LotPlan,
    VolumeFolio VolumeFolio,
    string Status,
    SourceTrace SourceTrace
)
{
    public static class Statuses
    {
        public const string KnownVolFol = "KnownVolFol";
        public const string UnknownVolFol = "UnknownVolFol";
    }
}
