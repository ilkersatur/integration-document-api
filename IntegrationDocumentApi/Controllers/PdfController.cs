using DinkToPdf;
using DinkToPdf.Contracts;
using IntegrationDocumentApi.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
namespace IntegrationDocumentApi.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class PdfController : ControllerBase
    {
        private readonly IConverter _converter;
        private readonly IWebHostEnvironment _env;

        public PdfController(IConverter converter, IWebHostEnvironment env)
        {
            _converter = converter;
            _env = env;
        }

        [HttpGet("generate")]
        public IActionResult GeneratePdf()
        {
            string dataPath = Path.Combine(_env.ContentRootPath, "data");

            var menus = JsonSerializer.Deserialize<List<Menu>>(System.IO.File.ReadAllText(Path.Combine(dataPath, "menus.json")));
            var submenus = JsonSerializer.Deserialize<List<Submenu>>(System.IO.File.ReadAllText(Path.Combine(dataPath, "submenus.json")));
            var contents = JsonSerializer.Deserialize<List<ContentEntry>>(System.IO.File.ReadAllText(Path.Combine(dataPath, "contents.json")));

            var sb = new System.Text.StringBuilder();

            foreach (var menu in menus)
            {
                sb.AppendLine($"# {menu.Title}");
                sb.AppendLine(); // Boş satır ekle

                var relatedSubmenus = submenus.Where(s => s.MenuId == menu.Id);
                foreach (var submenu in relatedSubmenus)
                {
                    sb.AppendLine($"## {submenu.Title}");
                    sb.AppendLine(); // Boş satır ekle

                    var content = contents.FirstOrDefault(c => c.SubmenuId == submenu.Id);
                    if (content != null && !string.IsNullOrWhiteSpace(content.Text))
                    {
                        sb.AppendLine(content.Text);
                        sb.AppendLine(); // Boş satır ekle
                    }
                }
            }

            string markdown = sb.ToString();
            string html = Markdig.Markdown.ToHtml(markdown);

            var doc = new HtmlToPdfDocument
            {
                GlobalSettings = new GlobalSettings
                {
                    PaperSize = PaperKind.A4,
                    Orientation = Orientation.Portrait,
                    DocumentTitle = "Generated PDF"
                },
                Objects = {
            new ObjectSettings {
                HtmlContent = html,
                WebSettings = { DefaultEncoding = "utf-8" }
            }
        }
            };

            var pdfBytes = _converter.Convert(doc);

            var outputDir = Path.Combine(_env.ContentRootPath, "Output");
            if (!Directory.Exists(outputDir))
                Directory.CreateDirectory(outputDir);

            var fileName = $"dokuman_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
            var filePath = Path.Combine(outputDir, fileName);

            System.IO.File.WriteAllBytes(filePath, pdfBytes);

            return File(pdfBytes, "application/pdf", fileName);
        }

    }
}