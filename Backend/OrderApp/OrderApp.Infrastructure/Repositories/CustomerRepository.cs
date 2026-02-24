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
    public class CustomerRepository : ICustomerRepository
    {
        private readonly AppDbContext _db;

        public CustomerRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<Customer?> GetByCodeAsync(string code)
        {
            return await _db.Customers.FirstOrDefaultAsync(c => c.CustomerCode == code);
        }
        public async Task<List<Customer>> GetAllAsync()
        {
            return await _db.Customers
                .OrderBy(c => c.CustomerCode)
                .ToListAsync();
        }
    }
}
