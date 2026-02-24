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
    public class OrderService
    {
        private readonly IOrderRepository _orderRepo;
        private readonly ICustomerRepository _customerRepo;
        private readonly ICacheService _cache;

        public OrderService(IOrderRepository orderRepo, ICustomerRepository customerRepo, ICacheService cache)
        {
            _orderRepo = orderRepo;
            _customerRepo = customerRepo;
            _cache = cache;
        }

        public async Task<(Order? order, bool fromCache)> GetOrderWithCacheFlagAsync(int id)
        {
            var cacheKey = $"order:{id}";
            var cached = await _cache.GetAsync<Order>(cacheKey);

            if (cached != null)
                return (cached, true);

            var order = await _orderRepo.GetByIdAsync(id);

            if (order != null)
                await _cache.SetAsync(cacheKey, order, TimeSpan.FromMinutes(5));

            return (order, false);
        }

        public async Task<OrderResponseDto> CreateOrderAsync(OrderRequestDto request)
        {
            // Validate customer exists
            var customer = await _customerRepo.GetByCodeAsync(request.CustomerCode);
            if (customer is null) throw new ArgumentException("Invalid customer code");

            var order = new Order
            {
                CustomerCode = request.CustomerCode,
                TaxRate = request.TaxRate,
                Items = request.Items.Select(i => new OrderItem
                {
                    ProductCode = i.ProductCode,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    Discount = i.Discount
                }).ToList()
            };

            CalculateTotals(order);

            await _orderRepo.AddAsync(order);

            // Cache created order
            await _cache.SetAsync($"order:{order.Id}", order, TimeSpan.FromMinutes(5));

            return await MapToResponseDtoAsync(order);
        }

        public async Task<OrderResponseDto?> UpdateOrderAsync(int orderId, OrderRequestDto request)
        {
            var existing = await _orderRepo.GetByIdAsync(orderId);
            if (existing is null) return null;

            // Validate customer exists
            var customer = await _customerRepo.GetByCodeAsync(request.CustomerCode);
            if (customer is null) throw new ArgumentException("Invalid customer code");

            // Replace header
            existing.CustomerCode = request.CustomerCode;
            existing.TaxRate = request.TaxRate;

            // Replace items (simple + reliable)
            existing.Items = request.Items.Select(i => new OrderItem
            {
                OrderId = orderId,
                ProductCode = i.ProductCode,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                Discount = i.Discount
            }).ToList();

            CalculateTotals(existing);

            await _orderRepo.UpdateAsync(existing);

            // Refresh cache
            await _cache.SetAsync($"order:{orderId}", existing, TimeSpan.FromMinutes(5));

            return await MapToResponseDtoAsync(existing);
        }

        public async Task<bool> DeleteOrderAsync(int orderId)
        {
            var existing = await _orderRepo.GetByIdAsync(orderId);
            if (existing is null) return false;

            await _orderRepo.DeleteAsync(existing);

            // Optional: remove cache by setting null short expiry (simple)
            await _cache.SetAsync($"order:{orderId}", existing, TimeSpan.FromSeconds(1));

            return true;
        }

        public async Task<OrderResponseDto> MapToResponseDtoAsync(Order order)
        {
            var customer = await _customerRepo.GetByCodeAsync(order.CustomerCode);

            return new OrderResponseDto
            {
                OrderId = order.Id,
                CustomerCode = order.CustomerCode,
                CustomerName = customer?.CustomerName,
                TaxRate = order.TaxRate,
                SubTotal = order.SubTotal,
                DiscountTotal = order.DiscountTotal,
                GrandTotal = order.GrandTotal,
                Items = order.Items.Select(i => new OrderItemDto
                {
                    ProductCode = i.ProductCode,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    Discount = i.Discount,
                    LineTotal = i.LineTotal
                }).ToList()
            };
        }

        private void CalculateTotals(Order order)
        {
            // Line totals
            foreach (var item in order.Items)
            {
                if (item.Quantity <= 0) throw new ArgumentException("Quantity must be > 0");
                if (item.UnitPrice < 0) throw new ArgumentException("UnitPrice cannot be negative");
                if (item.Discount < 0) throw new ArgumentException("Discount cannot be negative");

                var gross = item.Quantity * item.UnitPrice;
                if (item.Discount > gross) throw new ArgumentException("Discount cannot exceed line amount");

                item.LineTotal = gross - item.Discount;
            }

            order.SubTotal = order.Items.Sum(x => x.Quantity * x.UnitPrice);
            order.DiscountTotal = order.Items.Sum(x => x.Discount);

            var net = order.SubTotal - order.DiscountTotal;
            order.GrandTotal = net + (net * order.TaxRate / 100m);
        }
    }
}
