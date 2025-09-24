using System.Text.RegularExpressions;
using Property.Api.Models;
using Property.Api.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// In-memory store for demo/testing
builder.Services.AddSingleton<IPropertyStore, InMemoryPropertyStore>();

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();

// Server-side validators (mirror frontend rules)
static bool IsValidVol(string? s) => !string.IsNullOrWhiteSpace(s) && Regex.IsMatch(s, @"^\d{1,6}$");
static bool IsValidFol(string? s) => !string.IsNullOrWhiteSpace(s) && Regex.IsMatch(s, @"^\d{1,5}$");

// POST /api/property : normalize external payload and persist; returns { id, data }
app.MapPost("/api/property", (ExternalProperty ext, IPropertyStore store) =>
{
    var normalized = PropertyNormalizer.NormalizeProperty(ext);
    var saved = store.Create(normalized);
    return Results.Created($"/api/property/{saved.Id}", saved);
});

// GET /api/property/{id} : fetch by id
app.MapGet("/api/property/{id:int}", (int id, IPropertyStore store) =>
    store.TryGet(id, out var s) ? Results.Ok(s) : Results.NotFound());

// PUT /api/property/{id}/volume-folio : update volume/folio with validation
app.MapPut("/api/property/{id:int}/volume-folio",
    (int id, UpdateVolFolDto dto, IPropertyStore store) =>
{
    // Allow empty (to clear); if provided, must match digit-length rules
    var problems = new Dictionary<string, string[]>();
    if (!string.IsNullOrEmpty(dto.Volume) && !IsValidVol(dto.Volume)) problems["volume"] = ["Volume must be 1–6 digits"];
    if (!string.IsNullOrEmpty(dto.Folio)  && !IsValidFol(dto.Folio))  problems["folio"]  = ["Folio must be 1–5 digits"];
    if (problems.Count > 0) return Results.ValidationProblem(problems, statusCode: 400);

    var updated = store.UpdateVolumeFolio(id, dto.Volume, dto.Folio);
    return updated is null ? Results.NotFound() : Results.Ok(updated);
});

app.Run();

// ---- type declarations must be after ALL top-level statements ----
public record UpdateVolFolDto(string? Volume, string? Folio);




