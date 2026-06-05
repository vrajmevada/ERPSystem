namespace ERPSystem.Application.Features.People.DTOs;

public record CustomerDto(
    int Id,
    string Name,
    string Email,
    string PhoneNumber,
    string Address);