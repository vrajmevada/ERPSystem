using System;
using System.Threading.Tasks;
using ERPSystem.Application.Interfaces;
using ERPSystem.Persistence.Context;
using Microsoft.EntityFrameworkCore.Storage;

namespace ERPSystem.Persistence.Transactions;

public class TransactionManager : ITransactionManager
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _currentTransaction;

    public TransactionManager(ApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<IDisposable> BeginTransactionAsync()
    {
        if (_currentTransaction != null)
        {
            throw new InvalidOperationException("A transaction is already in progress.");
        }
        _currentTransaction = await _context.Database.BeginTransactionAsync();
        return _currentTransaction;
    }

    public async Task CommitAsync()
    {
        if (_currentTransaction == null)
        {
            throw new InvalidOperationException("No transaction in progress to commit.");
        }
        try
        {
            await _currentTransaction.CommitAsync();
        }
        finally
        {
            _currentTransaction.Dispose();
            _currentTransaction = null;
        }
    }

    public async Task RollbackAsync()
    {
        if (_currentTransaction == null)
        {
            return;
        }
        try
        {
            await _currentTransaction.RollbackAsync();
        }
        finally
        {
            _currentTransaction.Dispose();
            _currentTransaction = null;
        }
    }
}
