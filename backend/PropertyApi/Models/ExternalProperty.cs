namespace Property.Api.Models;

public record AddressParts(string? Street, string? Suburb, string? State, string? Postcode);
public record LotPlan(string? Lot, string? Plan);
public record Title(string? Volume, string? Folio);

public record ExternalProperty(
    string? Provider,
    string? RequestId,
    DateTimeOffset? ReceivedAt,
    AddressParts? AddressParts,
    string? FormattedAddress,
    LotPlan? LotPlan,
    Title? Title
);