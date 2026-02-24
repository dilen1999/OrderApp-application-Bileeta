using OrderApp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OrderApp.Application.Interfaces
{
    public interface ICustomerRepository
    {
        Task<Customer> GetByCodeAsync(string code);
        Task<List<Customer>> GetAllAsync();
    }
}
