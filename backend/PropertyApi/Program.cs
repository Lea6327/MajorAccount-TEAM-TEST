using Property.Api.Models;
using Property.Api.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseHttpsRedirection();
app.UseSwagger();
app.UseSwaggerUI();

app.MapPost("/api/property/normalize", (ExternalProperty external) =>
{
    var result = PropertyNormalizer.NormalizeProperty(external);
    return Results.Json(result);
});

app.Run();



