namespace ERPSystem.Application.Features.Inventory.DTOs;

public record CreateIndentLineDto(
    int ProductId,
    decimal Quantity,
    decimal? EstimatedRate,
    string Notes);