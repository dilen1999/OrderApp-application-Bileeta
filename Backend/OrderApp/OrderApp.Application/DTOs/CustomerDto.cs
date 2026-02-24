using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OrderApp.Application.DTOs
{
    public class CustomerDto
    {
        public string CustomerCode { get; set; } = default!;
        public string CustomerName { get; set; } = default!;
    }
}
