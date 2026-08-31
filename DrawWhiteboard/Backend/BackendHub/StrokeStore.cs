using DrawWhiteboard.Backend.Types;

public class StrokeStore
{
    private readonly List<Stroke> _strokes = new();

    public void AddPoint(Point point) {}
    public List<Stroke> GetAllStrokes() => _strokes;
}