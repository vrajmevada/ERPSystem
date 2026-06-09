using ERPSystem.Domain.Entities.Identity;

namespace ERPSystem.Application.Interfaces.Identity;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username);

    Task AddAsync(User user);
}