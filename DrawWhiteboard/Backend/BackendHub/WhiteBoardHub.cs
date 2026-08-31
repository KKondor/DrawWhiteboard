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

        public void SendPoint(Point point, Stroke stroke)
        {

        }
        public List<Stroke> GetStrokeHistory()
        {
            return new List<Stroke>();
        }
    }
}
