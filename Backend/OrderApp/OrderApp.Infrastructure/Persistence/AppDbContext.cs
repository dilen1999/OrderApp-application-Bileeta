using Microsoft.EntityFrameworkCore;
using OrderApp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OrderApp.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Customer> Customers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Customer>().HasKey(c => c.CustomerCode);

            modelBuilder.Entity<Order>()
                .HasMany(o => o.Items)
                .WithOne()
                .HasForeignKey(i => i.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seed customers (hard-coded values)
            modelBuilder.Entity<Customer>().HasData(
                new Customer { CustomerCode = "C001", CustomerName = "John" },
                new Customer { CustomerCode = "C002", CustomerName = "David" },
                new Customer { CustomerCode = "C003", CustomerName = "Karthik" }
            );
        }
    }
}
