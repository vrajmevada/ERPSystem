namespace ERPSystem.Application.Features.People.DTOs;

public record UpdateSupplierDto(
    string Name,
    string Email,
    string Phone,
    string Address);