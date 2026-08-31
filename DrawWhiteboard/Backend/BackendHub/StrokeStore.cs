using DrawWhiteboard.Backend.Types;

namespace DrawWhiteboard.Backend.BackendHub
{
    public class StrokeStore
    {
        private readonly List<Stroke> _strokes = new();

        public void AddPoint(Point point)
        {
            var stroke = _strokes.FirstOrDefault(s => s.StrokeId == point.StrokeId);
            if (stroke is null)
            {
                stroke = new Stroke(point.StrokeId, point.Color, point.Thickness);
                _strokes.Add(stroke);
            }

            stroke.Points.Add(point);
            stroke.Points.Sort((a, b) => a.PointId.CompareTo(b.PointId));
        }

        public List<Stroke> GetAllStrokes() => _strokes;
    }
}