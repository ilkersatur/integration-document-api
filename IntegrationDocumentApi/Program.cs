using DinkToPdf.Contracts;
using DinkToPdf;
using IntegrationDocumentApi.Data;

namespace IntegrationDocumentApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddAuthorization();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddSingleton(typeof(IConverter), new SynchronizedConverter(new PdfTools()));
            builder.Services.AddControllers();

            var wkhtmlPath = Path.Combine(Directory.GetCurrentDirectory(), "libwkhtmltox", "libwkhtmltox.dll");
            CustomAssemblyLoadContext context = new CustomAssemblyLoadContext();
            context.LoadUnmanagedLibrary(wkhtmlPath);

            var app = builder.Build();

            if (app.Environment.IsProduction())
            {
                app.UsePathBase("/Vpos/V1/VposDocument");
            }

            app.UseSwagger();

            if (app.Environment.IsProduction())
            {
                app.UseSwaggerUI(c =>
                {
                    // ❗ Relative path olmalı, başında "/" yok!
                    c.SwaggerEndpoint("swagger.json", "IntegrationDocumentApi V1");
                    c.RoutePrefix = "swagger";
                });
            }
            else
            {
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseRouting();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            app.Run();
        }
    }
}
