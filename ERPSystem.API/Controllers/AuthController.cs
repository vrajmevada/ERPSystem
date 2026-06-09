using ERPSystem.Application.Features.Identity.DTOs;
using ERPSystem.Application.Features.Identity.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly IAuthService _service;

    public AuthController(
        IAuthService service)
    {
        _service = service;
    }

    [HttpPost("register")]
    public async Task<IActionResult>
        Register(RegisterDto dto)
    {
        await _service.RegisterAsync(dto);

        return Ok();
    }

    [HttpPost("login")]
    public async Task<AuthResponseDto>
        Login(LoginDto dto)
    {
        return await _service.LoginAsync(dto);
    }
}