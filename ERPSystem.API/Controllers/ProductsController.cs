using ERPSystem.Application.Common;
using ERPSystem.Application.Features.Catalog.DTOs;
using ERPSystem.Application.Features.Catalog.Services;
using Microsoft.AspNetCore.Mvc;

using Microsoft.AspNetCore.Authorization;
using ERPSystem.Application.Security;

namespace ERPSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductService _service;

    public ProductsController(IProductService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetAll(
        string? search,
        string? sortBy,
        int page = 1,
        int pageSize = 10)
    {
        return Ok(
            await _service.GetAllAsync(
                search,
                sortBy,
                page,
                pageSize));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetById(int id)
    {
        var product = await _service.GetByIdAsync(id);

        if (product == null)
            return NotFound();

        return Ok(product);
    }

    [HttpPost]
    [Authorize(Policy = AppPolicies.MasterDataWrite)]
    public async Task<ActionResult<ProductDto>> Create(
        [FromBody] CreateProductDto dto)
    {
        var result = await _service.CreateAsync(dto);

        return Ok(result);
    }
    [HttpPut("{id}")]
    [Authorize(Policy = AppPolicies.MasterDataWrite)]
    public async Task<ActionResult<ProductDto>> Update(
    int id,
    [FromBody] UpdateProductDto dto)
    {
        var result =
            await _service.UpdateAsync(id, dto);

        if (result == null)
            return NotFound();

        return Ok(result);
    }
    [HttpDelete("{id}")]
    [Authorize(Policy = AppPolicies.MasterDataWrite)]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);

        return NoContent();
    }
}