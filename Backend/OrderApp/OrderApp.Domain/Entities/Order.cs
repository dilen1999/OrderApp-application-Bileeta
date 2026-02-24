using OrderApp.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OrderApp.Domain.Entities
{
    public class Order : BaseEntity
    {
        public string CustomerCode { get; set; }
        public decimal TaxRate { get; set; }

        public decimal SubTotal { get; set; }
        public decimal DiscountTotal { get; set; }
        public decimal GrandTotal { get; set; }

        public List<OrderItem> Items { get; set; } = new();
    }
}
