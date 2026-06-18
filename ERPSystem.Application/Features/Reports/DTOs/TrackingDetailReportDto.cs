using System;

namespace ERPSystem.Application.Features.Reports.DTOs;

public record TrackingDetailReportDto(
    int TransactionId,
    DateTime TransactionDate,
    int ProductId,
    string ProductName,
    int WarehouseId,
    string WarehouseName,
    int QuantityChange,
    string TransactionType,
    int CumulativeQuantity);
