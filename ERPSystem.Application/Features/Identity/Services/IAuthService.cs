using ERPSystem.Application.Features.Identity.DTOs;

namespace ERPSystem.Application.Features.Identity.Services;

public interface IAuthService
{
    Task RegisterAsync(RegisterDto dto);

    Task<AuthResponseDto> LoginAsync(
        LoginDto dto);
}