using System;
using System.Collections.Generic;

namespace ERPSystem.Application.Features.Inventory.DTOs;

public record CreateStockConvertDto(
    DateTime TransactionDate,
    string Remarks,
    List<CreateStockConvertSourceLineDto> SourceLines,
    List<CreateStockConvertDestinationLineDto> DestinationLines);
