using System;
using System.Collections.Generic;
using System.Text;

namespace ERPSystem.Domain.Enums;

public enum PurchaseOrderStatus
{
    Draft = 1,
    Approved = 2,
    Received = 3,
    Cancelled = 4
}