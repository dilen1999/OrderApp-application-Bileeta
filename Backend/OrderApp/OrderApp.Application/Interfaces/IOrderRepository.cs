using OrderApp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OrderApp.Application.Interfaces
{
    public interface IOrderRepository
    {
        Task<Order> GetByIdAsync(int id);
        Task AddAsync(Order order);
        Task UpdateAsync(Order order);
        Task DeleteAsync(Order order);
    }
}
