using System;
using System.Collections.Generic;

namespace ERPSystem.Application.Features.Inventory.DTOs;

public record TransferSlipDto(
    int Id,
    string SlipNumber,
    int FromWarehouseId,
    string FromWarehouseName,
    int ToWarehouseId,
    string ToWarehouseName,
    DateTime TransferDate,
    string Status,
    string Remarks,
    List<TransferSlipLineDto> Lines);
