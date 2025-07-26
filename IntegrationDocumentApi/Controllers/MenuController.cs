using IntegrationDocumentApi.Data;
using IntegrationDocumentApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace IntegrationDocumentApi.Controllers
{
    [ApiController]
    [Route("api/menus")]
    public class MenuController : ControllerBase
    {
        private readonly JsonDataService<Menu> _service = new("Data/menus.json");

        [HttpGet]
        public IActionResult GetAll() => Ok(_service.Load());

        [HttpPost]
        public IActionResult Add(Menu menu)
        {
            menu.Id = new Random().Next(1000, 9999); // ID üretimi basitçe
            _service.Add(menu);
            return Ok(menu);
        }
    }
}
