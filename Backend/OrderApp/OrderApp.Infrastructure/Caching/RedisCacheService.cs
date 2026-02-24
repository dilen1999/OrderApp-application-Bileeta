using Microsoft.Extensions.Caching.Distributed;
using OrderApp.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace OrderApp.Infrastructure.Caching
{
    public class RedisCacheService : ICacheService
    {
        private readonly IDistributedCache _cache;

        public RedisCacheService(IDistributedCache cache)
        {
            _cache = cache;
        }

        public async Task<T> GetAsync<T>(string key)
        {
            var data = await _cache.GetStringAsync(key);
            return data == null ? default :
                JsonSerializer.Deserialize<T>(data);
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan expiry)
        {
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiry
            };

            await _cache.SetStringAsync(key,
                JsonSerializer.Serialize(value),
                options);
        }
    }
}
