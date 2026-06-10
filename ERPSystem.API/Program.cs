using ERPSystem.API.Exceptions;
using ERPSystem.Application.Features.Catalog.Mapping;
using ERPSystem.Application.Features.Catalog.Services;
using ERPSystem.Application.Features.Catalog.Validators;
using ERPSystem.Application.Features.Dashboard.Services;
using ERPSystem.Application.Features.Identity.Services;
using ERPSystem.Application.Features.Inventory.Mapping;
using ERPSystem.Application.Features.Inventory.Services;
using ERPSystem.Application.Features.People.Services;
using ERPSystem.Application.Features.Purchasing.Services;
using ERPSystem.Application.Features.Sales.Services;
using ERPSystem.Application.Interfaces.Audit;
using ERPSystem.Application.Interfaces.Catalog;
using ERPSystem.Application.Interfaces.Dashboard;
using ERPSystem.Application.Interfaces.Identity;
using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Application.Interfaces.People;
using ERPSystem.Application.Interfaces.Purchasing;
using ERPSystem.Application.Interfaces.Sales;
using ERPSystem.Application.Security;
using ERPSystem.Domain.Entities.Identity;
using ERPSystem.Persistence.Context;
using ERPSystem.Persistence.Repositories;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;
using System.Text.Json.Serialization;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your valid token in the text input below.\r\n\r\nExample: \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\""
    });
    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
    });
});
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddProblemDetails();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddFluentValidationAutoValidation();
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters
            .Add(new JsonStringEnumConverter());
    });
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
builder.Services.AddScoped<
    IInventoryTransactionRepository,
    InventoryTransactionRepository>();

builder.Services.AddScoped<
    IInventoryTransactionService,
    InventoryTransactionService>();
builder.Services.AddScoped<
    ISupplierRepository,
    SupplierRepository>();

builder.Services.AddScoped<
    ISupplierService,
    SupplierService>();
builder.Services.AddScoped<
    IPurchaseOrderRepository,
    PurchaseOrderRepository>();

builder.Services.AddScoped<
    IPurchaseOrderService,
    PurchaseOrderService>();
builder.Services.AddScoped<
    ISalesOrderRepository,
    SalesOrderRepository>();

builder.Services.AddScoped<
    ISalesOrderService,
    SalesOrderService>();
builder.Services.AddScoped<
    IDashboardService,
    DashboardService>();
builder.Services.AddScoped<
    IDashboardRepository,
    DashboardRepository>();

builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(
        "JwtSettings"));

builder.Services.AddScoped<
    IUserRepository,
    UserRepository>();

builder.Services.AddScoped<
    IAuthService,
    AuthService>();
builder.Services.AddScoped<
    IAuditLogRepository,
    AuditLogRepository>();
var jwtSettings =
    builder.Configuration
        .GetSection("JwtSettings")
        .Get<JwtSettings>();

builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer =
                    jwtSettings!.Issuer,

                ValidAudience =
                    jwtSettings.Audience,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            jwtSettings.Key))
            };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AppPolicies.MasterDataWrite, policy =>
        policy.RequireRole(AppRoles.Admin, AppRoles.Manager));

    options.AddPolicy(AppPolicies.OrderApprove, policy =>
        policy.RequireRole(AppRoles.Admin, AppRoles.Manager));

    options.AddPolicy(AppPolicies.OrderOperate, policy =>
        policy.RequireRole(AppRoles.Admin, AppRoles.Manager, AppRoles.Operator));
});

var app = builder.Build();
app.UseExceptionHandler();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseAuthentication();
app.UseAuthorization();
app.UseHttpsRedirection();

app.MapControllers();
Console.WriteLine(
    builder.Configuration.GetConnectionString("DefaultConnection"));
app.Run();