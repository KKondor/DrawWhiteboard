using DrawWhiteboard.Backend.BackendHub;

namespace DrawWhiteboard.Backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var MyAllowedSpecificOrigins = "_myAllowSpecificOrigins";
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddSingleton<StrokeStore>();
            builder.Services.AddSignalR();
            builder.Services.AddCors(opt =>
            {
                opt.AddPolicy(name: MyAllowedSpecificOrigins,
                                  policy =>
                                  {
                                      policy.WithOrigins(builder.Configuration.GetConnectionString("DefaultFrontEnd"))
                                      .AllowAnyHeader()
                                      .AllowAnyMethod()
                                      .AllowCredentials();
                                  });
            });
            var app = builder.Build();
            app.MapHub<WhiteBoardHub>("/whiteboardhub");
            app.Run();
        }
    }
}
