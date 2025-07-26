using IntegrationDocumentApi.Data;
using IntegrationDocumentApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace IntegrationDocumentApi.Controllers
{
    [ApiController]
    [Route("api/menus")]
    public class MenuController : ControllerBase
    {
        private readonly JsonDataService<Menu> _service = new(
            "Data/menus.json",
            m => m.Id,
            (m, id) => m.Id = id
        );

        [HttpGet]
        public IActionResult GetAll() => Ok(_service.Load());

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var item = _service.Load().FirstOrDefault(m => m.Id == id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public IActionResult Add(Menu menu)
        {
            _service.Add(menu);
            return Ok(menu);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Menu updatedMenu)
        {
            var list = _service.Load();
            var menu = list.FirstOrDefault(m => m.Id == id);
            if (menu == null) return NotFound();

            menu.Title = updatedMenu.Title;
            _service.Save(list);
            return Ok(menu);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var list = _service.Load();
            var menu = list.FirstOrDefault(m => m.Id == id);
            if (menu == null) return NotFound();

            list.Remove(menu);
            _service.Save(list);
            return NoContent();
        }
    }

}
