using ERPSystem.Application.Interfaces.Catalog;
using ERPSystem.Domain.Entities.Catalog;
using Microsoft.AspNetCore.Mvc;
using ERPSystem.Application.Features.Catalog.DTOs;

namespace ERPSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryRepository _repository;

    public CategoriesController(ICategoryRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _repository.GetAllAsync();

        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var category = await _repository.GetByIdAsync(id);

        if (category == null)
            return NotFound();

        return Ok(category);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
    [FromBody] CreateCategoryDto dto)
    {
        var category = new Category
        {
            Name = dto.Name
        };

        await _repository.AddAsync(category);

        return Ok(new CategoryDto
        {
            Id = category.Id,
            Name = category.Name
        });
    }
}