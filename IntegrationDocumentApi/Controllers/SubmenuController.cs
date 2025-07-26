using IntegrationDocumentApi.Data;
using IntegrationDocumentApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace IntegrationDocumentApi.Controllers
{
    [ApiController]
    [Route("api/submenus")]
    public class SubmenuController : ControllerBase
    {
        private readonly JsonDataService<Submenu> _service = new("Data/submenus.json");

        [HttpGet]
        public IActionResult GetAll() => Ok(_service.Load());

        [HttpPost]
        public IActionResult Add(Submenu submenu)
        {
            submenu.Id = new Random().Next(1000, 9999);
            _service.Add(submenu);
            return Ok(submenu);
        }
    }
}
