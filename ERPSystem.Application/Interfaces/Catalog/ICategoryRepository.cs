using ERPSystem.Domain.Entities.Catalog;
using System;
using System.Collections.Generic;
using System.Text;

namespace ERPSystem.Application.Interfaces.Catalog;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllAsync();
    Task<Category?> GetByIdAsync(int id);
    Task AddAsync(Category category);
    Task UpdateAsync(Category category);
    Task DeleteAsync(Category category);

}
