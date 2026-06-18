using ERPSystem.Domain.Entities.People;
using ERPSystem.Persistence.Context;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace ERPSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DepartmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DepartmentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Department>>> GetAll()
    {
        // Dynamically seed departments if none exist
        if (!await _context.Departments.AnyAsync())
        {
            var defaultDepts = new List<Department>
            {
                new() { Name = "Store", Code = "STORE", IsActive = true },
                new() { Name = "Production", Code = "PROD", IsActive = true },
                new() { Name = "QC", Code = "QC", IsActive = true },
                new() { Name = "Sales", Code = "SALES", IsActive = true },
                new() { Name = "Purchase", Code = "PURCH", IsActive = true },
                new() { Name = "Admin", Code = "ADMIN", IsActive = true }
            };

            await _context.Departments.AddRangeAsync(defaultDepts);
            await _context.SaveChangesAsync();
        }

        var departments = await _context.Departments.Where(d => d.IsActive).ToListAsync();
        return Ok(departments);
    }
}
