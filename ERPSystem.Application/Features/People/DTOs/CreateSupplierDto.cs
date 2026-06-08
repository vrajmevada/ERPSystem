namespace ERPSystem.Application.Features.People.DTOs;

public record CreateSupplierDto(
    string Name,
    string Email,
    string Phone,
    string Address);