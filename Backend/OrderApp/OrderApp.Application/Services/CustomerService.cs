using OrderApp.Application.DTOs;
using OrderApp.Application.Interfaces;
using OrderApp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OrderApp.Application.Services
{
    public class CustomerService
    {
        private readonly ICustomerRepository _customerRepo;
        private readonly ICacheService _cache;

        public CustomerService(ICustomerRepository customerRepo, ICacheService cache)
        {
            _customerRepo = customerRepo;
            _cache = cache;
        }

        // ✅ For GET /api/customers/{code}
        public async Task<(Customer? customer, bool fromCache)> GetCustomerWithCacheFlagAsync(string code)
        {
            var cacheKey = $"customer:{code}";
            var cached = await _cache.GetAsync<Customer>(cacheKey);

            if (cached != null)
                return (cached, true);

            var customer = await _customerRepo.GetByCodeAsync(code);

            if (customer != null)
                await _cache.SetAsync(cacheKey, customer, TimeSpan.FromMinutes(30));

            return (customer, false);
        }

        // ✅ For GET /api/customers
        public async Task<(List<Customer> customers, bool fromCache)> GetAllCustomersWithCacheFlagAsync()
        {
            var cacheKey = "customers:all";
            var cached = await _cache.GetAsync<List<Customer>>(cacheKey);

            if (cached != null)
                return (cached, true);

            var customers = await _customerRepo.GetAllAsync();
            await _cache.SetAsync(cacheKey, customers, TimeSpan.FromMinutes(30));

            return (customers, false);
        }

        public static CustomerDto MapToDto(Customer c) => new()
        {
            CustomerCode = c.CustomerCode,
            CustomerName = c.CustomerName
        };
    }
}
