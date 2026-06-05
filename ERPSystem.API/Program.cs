using ERPSystem.API.Exceptions;
using ERPSystem.Application.Features.Catalog.Services;
using ERPSystem.Application.Features.Catalog.Validators;
using ERPSystem.Application.Interfaces.Catalog;
using ERPSystem.Persistence.Context;
using ERPSystem.Persistence.Repositories;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;
using ERPSystem.Application.Features.Catalog.Mapping;

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
builder.Services.AddScoped<
    IProductService,
    ProductService>();
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