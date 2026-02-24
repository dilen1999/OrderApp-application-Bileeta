using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OrderApp.Application.DTOs
{
    public class OrderItemDto
    {
        public string ProductCode { get; set; } = default!;
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Discount { get; set; }

        // Response field (optional in request)
        public decimal LineTotal { get; set; }
    }
}
