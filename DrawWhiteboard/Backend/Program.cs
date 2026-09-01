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
            var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

            builder.Services.AddCors(opt =>
            {
                opt.AddPolicy(name: MyAllowedSpecificOrigins,
                    policy =>
                    {
                        policy.WithOrigins(allowedOrigins)
                            .AllowAnyHeader()
                            .AllowAnyMethod()
                            .AllowCredentials();
                    });
            });
            var app = builder.Build();
            app.UseCors(MyAllowedSpecificOrigins);
            app.MapHub<WhiteBoardHub>("/whiteboardhub");
            app.Run();
        }
    }
}
