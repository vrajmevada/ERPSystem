namespace ERPSystem.Application.Features.People.DTOs;

public record UpdateCustomerDto(
    string Name,
    string Email,
    string PhoneNumber,
    string Address);