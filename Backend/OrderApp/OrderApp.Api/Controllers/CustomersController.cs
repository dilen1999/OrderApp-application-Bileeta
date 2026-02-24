using Microsoft.AspNetCore.Mvc;
using OrderApp.Application.DTOs;
using OrderApp.Application.Interfaces;
using OrderApp.Application.Services;

namespace OrderApp.Api.Controllers
{
    [ApiController]
    [Route("api/customers")]
    public class CustomersController : ControllerBase
    {
        private readonly CustomerService _customerService;

        public CustomersController(CustomerService customerService)
        {
            _customerService = customerService;
        }

        // GET: api/customers/C001
        [HttpGet("{code}")]
        public async Task<ActionResult<CustomerDto>> GetByCode(string code)
        {
            var (customer, fromCache) = await _customerService.GetCustomerWithCacheFlagAsync(code);

            if (customer is null)
                return NotFound(new { message = "Customer not found" });

            Response.Headers["X-Cache"] = fromCache ? "HIT" : "MISS";

            return Ok(CustomerService.MapToDto(customer));
        }

        // GET: api/customers
        [HttpGet]
        public async Task<ActionResult<List<CustomerDto>>> GetAll()
        {
            var (customers, fromCache) = await _customerService.GetAllCustomersWithCacheFlagAsync();

            Response.Headers["X-Cache"] = fromCache ? "HIT" : "MISS";

            var dtos = customers.Select(CustomerService.MapToDto).ToList();
            return Ok(dtos);
        }
    }
}
