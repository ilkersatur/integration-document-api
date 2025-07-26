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

        private readonly JsonDataService<Submenu> _submenuService = new(
            "Data/submenus.json",
            s => s.Id,
            (s, id) => s.Id = id
        );

        private readonly JsonDataService<ContentEntry> _contentService = new(
            "Data/contents.json",
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
            var menus = _service.Load();
            var menu = menus.FirstOrDefault(m => m.Id == id);
            if (menu == null) return NotFound();

            // Alt menüleri ve içeriklerini yükle
            var submenus = _submenuService.Load().Where(s => s.MenuId == id).ToList();
            var contents = _contentService.Load();

            // Alt menülerin içeriklerini sil
            foreach (var submenu in submenus)
            {
                contents.RemoveAll(c => c.SubmenuId == submenu.Id);
            }
            _contentService.Save(contents);

            // Alt menüleri sil
            var allSubmenus = _submenuService.Load();
            allSubmenus.RemoveAll(s => s.MenuId == id);
            _submenuService.Save(allSubmenus);

            // Menü sil
            menus.Remove(menu);
            _service.Save(menus);

            return NoContent();
        }

    }

}
