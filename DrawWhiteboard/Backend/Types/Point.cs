namespace DrawWhiteboard.Backend.Types
{
    public record Point(int PointId, double X, double Y, Guid StrokeId, string Color, double Thickness);
}
