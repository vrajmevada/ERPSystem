namespace ERPSystem.Application.Features.People.DTOs;

public record CreateCustomerDto(
    string Name,
    string Email,
    string PhoneNumber,
    string Address);