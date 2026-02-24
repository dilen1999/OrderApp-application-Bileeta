using Microsoft.EntityFrameworkCore;
using OrderApp.Application.Interfaces;
using OrderApp.Domain.Entities;
using OrderApp.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OrderApp.Infrastructure.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly AppDbContext _db;

        public OrderRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<Order?> GetByIdAsync(int id)
        {
            return await _db.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task AddAsync(Order order)
        {
            _db.Orders.Add(order);
            await _db.SaveChangesAsync();
        }

        public async Task UpdateAsync(Order order)
        {
            // EF will track changes if loaded from context.
            // If you replaced Items list, ensure proper behavior:
            _db.Orders.Update(order);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(Order order)
        {
            _db.Orders.Remove(order);
            await _db.SaveChangesAsync();
        }
    }
}
