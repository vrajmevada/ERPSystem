using System;
using System.Collections.Generic;

namespace ERPSystem.Application.Features.Inventory.DTOs;

public record CreateMaterialInwardDto(
    int WarehouseId,
    DateTime TransactionDate,
    string Remarks,
    string InwardType,
    string ReferenceNumber,
    List<CreateMaterialInwardLineDto> Lines);
