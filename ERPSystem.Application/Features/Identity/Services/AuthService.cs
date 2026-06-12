using ERPSystem.Application.Exceptions;
using ERPSystem.Application.Features.Identity.DTOs;
using ERPSystem.Application.Interfaces.Identity;
using ERPSystem.Application.Security;
using ERPSystem.Domain.Entities.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ERPSystem.Application.Features.Identity.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly JwtSettings _jwtSettings;

    public AuthService(
        IUserRepository userRepository,
        IOptions<JwtSettings> jwtOptions)
    {
        _userRepository = userRepository;
        _jwtSettings = jwtOptions.Value;
    }

    public async Task RegisterAsync(RegisterDto dto)
    {
        var existingUser =
            await _userRepository
                .GetByUsernameAsync(dto.Username);

        if (existingUser != null)
        {
            throw new BusinessException(
                "Username already exists.");
        }

        var user = new User
        {
            Username = dto.Username,
            PasswordHash =
                PasswordHasher.Hash(dto.Password),
            Role = "Viewer" // Enforce 'Viewer' role for all self-registrations for security
        };

        await _userRepository.AddAsync(user);
    }

    public async Task<AuthResponseDto>
        LoginAsync(LoginDto dto)
    {
        var user =
            await _userRepository
                .GetByUsernameAsync(dto.Username);

        if (user == null ||
            !PasswordHasher.Verify(
                dto.Password,
                user.PasswordHash))
        {
            throw new BusinessException(
                "Invalid username or password.");
        }

        var token = GenerateToken(user);

        return new AuthResponseDto(token);
    }

    private string GenerateToken(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Role, user.Role)
        };

        var key =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _jwtSettings.Key));

        var credentials =
            new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

        var token =
            new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: credentials);

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}