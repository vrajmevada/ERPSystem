using ERPSystem.Application.Common;
using ERPSystem.Application.Features.People.DTOs;
using ERPSystem.Application.Features.People.Services;
using Microsoft.AspNetCore.Mvc;

using Microsoft.AspNetCore.Authorization;
using ERPSystem.Application.Security;

namespace ERPSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _service;

    public CustomersController(ICustomerService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<CustomerDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? sortBy,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        return Ok(await _service.GetAllAsync(search, sortBy, page, pageSize));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerDto>> GetById(int id)
    {
        var customer = await _service.GetByIdAsync(id);

        if (customer == null)
            return NotFound();

        return Ok(customer);
    }

    [HttpPost]
    [Authorize(Policy = AppPolicies.MasterDataWrite)]
    public async Task<ActionResult<CustomerDto>> Create(
        [FromBody] CreateCustomerDto dto)
    {
        var result = await _service.CreateAsync(dto);

        return Ok(result);
    }
    [HttpPut("{id}")]
    [Authorize(Policy = AppPolicies.MasterDataWrite)]
    public async Task<IActionResult> Update(
    int id,
    UpdateCustomerDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);

        if (!updated)
            return NotFound();

        return NoContent();
    }
    [HttpDelete("{id}")]
    [Authorize(Policy = AppPolicies.MasterDataWrite)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);

        if (!deleted)
            return NotFound();

        return NoContent();
    }
}