using System;
using System.Collections.Generic;

namespace ERPSystem.Application.Features.Inventory.DTOs;

public record StockConvertDto(
    int Id,
    string VoucherNumber,
    DateTime TransactionDate,
    string Remarks,
    string Status,
    List<StockConvertSourceLineDto> SourceLines,
    List<StockConvertDestinationLineDto> DestinationLines);
