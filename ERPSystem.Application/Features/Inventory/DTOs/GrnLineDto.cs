namespace ERPSystem.Application.Features.Inventory.DTOs;
public record GrnLineDto(
    int Id,
    int ProductId,
    string ProductName,
    int OrderedQuantity,
    int ReceivedQuantity);