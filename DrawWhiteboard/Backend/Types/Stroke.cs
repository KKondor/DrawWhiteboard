namespace DrawWhiteboard.Backend.Types
{
    public class Stroke
    {
        public Stroke(Guid strokeId, string color, double thickness)
        {
            StrokeId = strokeId;
            Color = color;
            Thickness = thickness;
            Points = [];
        }

        public Guid StrokeId { get; }
        public string Color { get; }
        public double Thickness { get; }
        public List<Point> Points { get; }
    }
}
