using ERPSystem.Domain.Enums;

namespace ERPSystem.Application.Features.Purchasing.DTOs;

public record PurchaseOrderDto(
    int Id,
    string OrderNumber,
    int SupplierId,
    string SupplierName,
    DateTime OrderDate,
    PurchaseOrderStatus Status,
    List<PurchaseOrderItemDto> Items);