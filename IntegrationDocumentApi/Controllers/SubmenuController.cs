using IntegrationDocumentApi.Data;
using IntegrationDocumentApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace IntegrationDocumentApi.Controllers
{
    [ApiController]
    [Route("api/submenus")]
    public class SubmenuController : ControllerBase
    {
        private readonly JsonDataService<Submenu> _service = new(
            "Data/submenus.json",
            s => s.Id,
            (s, id) => s.Id = id
        );

        [HttpGet]
        public IActionResult GetAll() => Ok(_service.Load());

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var item = _service.Load().FirstOrDefault(s => s.Id == id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public IActionResult Add(Submenu submenu)
        {
            _service.Add(submenu);
            return Ok(submenu);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Submenu updatedSubmenu)
        {
            var list = _service.Load();
            var submenu = list.FirstOrDefault(s => s.Id == id);
            if (submenu == null) return NotFound();

            submenu.Title = updatedSubmenu.Title;
            submenu.MenuId = updatedSubmenu.MenuId;
            _service.Save(list);
            return Ok(submenu);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var list = _service.Load();
            var submenu = list.FirstOrDefault(s => s.Id == id);
            if (submenu == null) return NotFound();

            list.Remove(submenu);
            _service.Save(list);
            return NoContent();
        }
    }
}
