using DrawWhiteboard.Backend.Types;
using Microsoft.AspNetCore.SignalR;

namespace DrawWhiteboard.Backend.BackendHub
{
    public class WhiteBoardHub : Hub
    {
        private readonly StrokeStore _strokeStoreSingleton;

        public WhiteBoardHub(StrokeStore strokeStoreSingleton)
        {
            _strokeStoreSingleton = strokeStoreSingleton;
        }

        public async Task SendPoint(Point point)
        {
            _strokeStoreSingleton.AddPoint(point);
            await Clients.Others.SendAsync("ReceivePoint", point);
        }
        public async Task<List<Stroke>> GetStrokeHistory()
        {
            return _strokeStoreSingleton.GetAllStrokes();
        }
        public async Task UndoLastStroke(Guid strokeId)
        {
            _strokeStoreSingleton.RemoveStroke(strokeId);
            await Clients.All.SendAsync("StrokeRemoved", strokeId);
        }
    }
}
