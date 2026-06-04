using ERPSystem.Application.Features.Catalog.DTOs;
using ERPSystem.Application.Interfaces.Catalog;
using ERPSystem.Domain.Entities.Catalog;
using Microsoft.AspNetCore.Mvc;

namespace ERPSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductRepository _repository;

    public ProductsController(IProductRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var products = await _repository.GetAllAsync();

        var result = products.Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Price = p.Price,
            CategoryId = p.CategoryId,
            CategoryName = p.Category.Name
        });

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _repository.GetByIdAsync(id);

        if (product == null)
            return NotFound();

        var dto = new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Price = product.Price,
            CategoryId = product.CategoryId,
            CategoryName = product.Category.Name
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Price = dto.Price,
            CategoryId = dto.CategoryId
        };

        await _repository.AddAsync(product);

        return Ok(product);
    }
}