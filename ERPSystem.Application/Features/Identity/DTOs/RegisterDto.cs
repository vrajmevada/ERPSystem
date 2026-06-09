namespace ERPSystem.Application.Features.Identity.DTOs;

public record RegisterDto(
    string Username,
    string Password,
    string Role);