namespace ERPSystem.Application.Features.Inventory.DTOs;
public record IndentLineDto(
    int Id,
    int IndentId,
    int LineNo,
    int ProductId,
    string ProductName,
    decimal Quantity,
    decimal? EstimatedRate,
    string Notes
);
