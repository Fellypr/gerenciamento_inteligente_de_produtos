using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace back_end.Hubs
{
    public class ScrapingHub : Hub
    {
        public string GetConnectionId() => Context.ConnectionId;
    }
}
