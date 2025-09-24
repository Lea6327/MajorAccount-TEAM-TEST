using Property.Api.Models;
using Property.Api.Services;
using FluentAssertions;

namespace Property.Api.Tests;

public class PropertyNormalizerTests
{
    [Fact]
    public void Known_VolFol_Should_Set_Known_Status()
    {
        var ext = new ExternalProperty(
            "VIC-DDP","REQ-1",DateTimeOffset.Parse("2025-08-30T03:12:45Z"),
            new AddressParts("10 Example St","Carlton","VIC","3053"),
            null, new LotPlan("12","PS123456"), new Title("123456","12345")
        );
        var r = PropertyNormalizer.NormalizeProperty(ext);
        r.Status.Should().Be("KnownVolFol");
        r.VolumeFolio.Volume.Should().Be("123456");
        r.VolumeFolio.Folio.Should().Be("12345");
    }

    [Fact]
    public void Unknown_When_Empty_Strings()
    {
        var ext = new ExternalProperty(
            "VIC-DDP","REQ-1",DateTimeOffset.Parse("2025-08-30T03:12:45Z"),
            new AddressParts("10 Example St","Carlton","VIC","3053"),
            "10 Example St, Carlton VIC 3053", new LotPlan("12","PS123456"), new Title("","")
        );
        var r = PropertyNormalizer.NormalizeProperty(ext);
        r.Status.Should().Be("UnknownVolFol");
        r.VolumeFolio.Volume.Should().BeNull();
        r.VolumeFolio.Folio.Should().BeNull();
    }

    [Fact]
    public void Compose_Address_When_No_Formatted()
    {
        var ext = new ExternalProperty(
            null,null,null,
            new AddressParts(" 10  Example   St ","Carlton","VIC","3053"),
            null, null, null
        );
        var r = PropertyNormalizer.NormalizeProperty(ext);
        r.FullAddress.Should().Be("10 Example St, Carlton VIC 3053");
    }

    [Fact]
    public void Preserve_SourceTrace()
    {
        var ext = new ExternalProperty(
            "VIC-DDP","REQ-12345",DateTimeOffset.Parse("2025-08-30T03:12:45Z"),
            null,"A", null, null
        );
        var r = PropertyNormalizer.NormalizeProperty(ext);
        r.SourceTrace.Provider.Should().Be("VIC-DDP");
        r.SourceTrace.RequestId.Should().Be("REQ-12345");
        r.SourceTrace.ReceivedAt.Should().Be("2025-08-30T03:12:45Z");
    }
}
