using System;
using System.Threading.Tasks;

namespace ERPSystem.Application.Interfaces;

public interface ITransactionManager
{
    Task<IDisposable> BeginTransactionAsync();
    Task CommitAsync();
    Task RollbackAsync();
}
