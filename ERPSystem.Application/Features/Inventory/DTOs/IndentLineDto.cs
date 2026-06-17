namespace ERPSystem.Application.Features.Inventory.DTOs;
public record IndentLineDto(
    int Id,
    int IndentId,
    int LineNo,
    int ProductId,
    decimal Quantity,
    decimal? EstimatedRate,
    string Notes
);
