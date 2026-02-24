using Microsoft.EntityFrameworkCore;
using OrderApp.Application.Interfaces;
using OrderApp.Application.Services;
using OrderApp.Infrastructure.Caching;
using OrderApp.Infrastructure.Persistence;
using OrderApp.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration["Redis:Connection"];
});

builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<ICacheService, RedisCacheService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<CustomerService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", p =>
        p.WithOrigins("http://localhost:3081") 
         .AllowAnyHeader()
         .AllowAnyMethod());
});



var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors("frontend");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
