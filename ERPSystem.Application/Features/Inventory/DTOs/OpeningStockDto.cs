using System;

namespace ERPSystem.Application.Features.Inventory.DTOs;

public record OpeningStockDto(
    int Id,
    int ProductId,
    string ProductName,
    int WarehouseId,
    string WarehouseName,
    int Quantity,
    decimal Rate,
    decimal Amount,
    DateTime TransactionDate,
    string Remarks);
