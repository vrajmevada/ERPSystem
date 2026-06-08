namespace ERPSystem.Application.Features.People.DTOs;

public record SupplierDto(
    int Id,
    string Name,
    string Email,
    string Phone,
    string Address);