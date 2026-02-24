using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OrderApp.Application.DTOs
{
    public class OrderRequestDto
    {
        public string CustomerCode { get; set; } = default!;
        public decimal TaxRate { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }
}
