
namespace DrawWhiteboard
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddSingleton<StrokeStore>();
            var app = builder.Build();
           
            app.Run();
        }
    }
}
