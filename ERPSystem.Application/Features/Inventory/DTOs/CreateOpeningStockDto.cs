using System;

namespace ERPSystem.Application.Features.Inventory.DTOs;

public record CreateOpeningStockDto(
    int ProductId,
    int WarehouseId,
    int Quantity,
    decimal Rate,
    DateTime TransactionDate,
    string Remarks);
