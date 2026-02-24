using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OrderApp.Application.DTOs
{
    public class OrderResponseDto
    {
        public int OrderId { get; set; }
        public string CustomerCode { get; set; } = default!;
        public string? CustomerName { get; set; }
        public decimal TaxRate { get; set; }

        public decimal SubTotal { get; set; }
        public decimal DiscountTotal { get; set; }
        public decimal GrandTotal { get; set; }

        public List<OrderItemDto> Items { get; set; } = new();
    }
}
