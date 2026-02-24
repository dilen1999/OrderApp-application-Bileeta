using OrderApp.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OrderApp.Domain.Entities
{
    public class OrderItem : BaseEntity
    {
        public int OrderId { get; set; }
        public string ProductCode { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Discount { get; set; }

        public decimal LineTotal { get; set; }
    }
}
