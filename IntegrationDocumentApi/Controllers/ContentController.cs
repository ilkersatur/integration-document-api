using IntegrationDocumentApi.Data;
using IntegrationDocumentApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace IntegrationDocumentApi.Controllers
{
    [ApiController]
    [Route("api/contents")]
    public class ContentController : ControllerBase
    {
        private readonly JsonDataService<ContentEntry> _service = new("Data/contents.json");

        [HttpGet]
        public IActionResult GetAll() => Ok(_service.Load());

        [HttpPost]
        public IActionResult Add(ContentEntry entry)
        {
            _service.Add(entry);
            return Ok(entry);
        }
    }
}
