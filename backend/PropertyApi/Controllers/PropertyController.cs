using Microsoft.AspNetCore.Mvc;
using Property.Api.Models;
using Property.Api.Services;

namespace Property.Api.Controllers;

[ApiController]
[Route("api/property")]
public class PropertyController : ControllerBase
{
    [HttpPost("normalize")]
    public ActionResult<InternalProperty> Normalize([FromBody] ExternalProperty input)
    {
        if (input is null) return BadRequest("Invalid payload.");
        var result = PropertyNormalizer.NormalizeProperty(input);
        return Ok(result);
    }
}