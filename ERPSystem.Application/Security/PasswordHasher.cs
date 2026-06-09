using BCrypt.Net;

namespace ERPSystem.Application.Security;

public static class Passwordhasher
{
    public static string Hash(
        string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(
            password);
    }
    public static bool Verify(
        string password,
        string hash)
    {
        return BCrypt.Net.BCrypt.Verify(
            password,
            hash);
    }
}