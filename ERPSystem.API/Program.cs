using ERPSystem.API.Exceptions;
using ERPSystem.Application.Features.Catalog.Mapping;
using ERPSystem.Application.Features.Catalog.Services;
using ERPSystem.Application.Features.Catalog.Validators;
using ERPSystem.Application.Features.Inventory.Mapping;
using ERPSystem.Application.Features.Inventory.Services;
using ERPSystem.Application.Features.People.Services;
using ERPSystem.Application.Interfaces.Catalog;
using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Application.Interfaces.People;
using ERPSystem.Persistence.Context;
using ERPSystem.Persistence.Repositories;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddProblemDetails();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddFluentValidationAutoValidation();

builder.Services.AddScoped<
    ICategoryService,
    CategoryService>();

builder.Services.AddValidatorsFromAssemblyContaining<
    CreateCategoryDtoValidator>();

builder.Services.AddScoped<
    ICategoryRepository,
    CategoryRepository>();

builder.Services.AddScoped<
    IProductRepository,
    ProductRepository>();
ProductMappingConfig.Register();
StockItemMappingConfig.Register();
builder.Services.AddScoped<
    IProductService,
    ProductService>();
builder.Services.AddScoped<
    ICustomerRepository,
    CustomerRepository>();
builder.Services.AddScoped<
    IStockItemRepository,
    StockItemRepository>();

builder.Services.AddScoped<
    IStockItemService,
    StockItemService>();
builder.Services.AddScoped<
    ICustomerService,
    CustomerService>();
builder.Services.AddScoped<
    IWarehouseRepository,
    WarehouseRepository>();
builder.Services.AddScoped<
    IWarehouseService,
    WarehouseService>();
var app = builder.Build();
app.UseExceptionHandler();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();