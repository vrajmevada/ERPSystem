using ERPSystem.Application.Features.People.DTOs;
using ERPSystem.Application.Features.People.Services;
using Microsoft.AspNetCore.Mvc;

namespace ERPSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _service;

    public CustomersController(ICustomerService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CustomerDto>>> GetAll()
    {
        return Ok(await _service.GetAllAsync());
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
    public async Task<ActionResult<CustomerDto>> Create(
        [FromBody] CreateCustomerDto dto)
    {
        var result = await _service.CreateAsync(dto);

        return Ok(result);
    }
}