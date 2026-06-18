using System;
using System.Collections.Generic;

namespace ERPSystem.Application.Features.Inventory.DTOs;

public record CreateDeliveryChallanDto(
    int CustomerId,
    int FromWarehouseId,
    DateTime ChallanDate,
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
    List<CreateDeliveryChallanLineDto> Lines);
