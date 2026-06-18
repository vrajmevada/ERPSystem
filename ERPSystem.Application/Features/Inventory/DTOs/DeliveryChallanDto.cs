using System;
using System.Collections.Generic;

namespace ERPSystem.Application.Features.Inventory.DTOs;

public record DeliveryChallanDto(
    int Id,
    string ChallanNumber,
    int CustomerId,
    string CustomerName,
    int FromWarehouseId,
    string FromWarehouseName,
    DateTime ChallanDate,
    string Status,
    string Remarks,
    string DispatchDocNo,
    string DispatchThrough,
    string Destination,
    string TermsOfDelivery,
    string LRNo,
    DateTime? LRDt,
    string TransporterName,
    bool IsLRReceived,
    string ContactPerson,
    List<DeliveryChallanLineDto> Lines);
