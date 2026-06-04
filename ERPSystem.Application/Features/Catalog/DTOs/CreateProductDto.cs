namespace ERPSystem.Application.Features.Catalog.DTOs;

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; } 
    public int CategoryId  { get; set; }
}
