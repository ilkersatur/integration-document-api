using IntegrationDocumentApi.Data;
using IntegrationDocumentApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace IntegrationDocumentApi.Controllers
{
    [ApiController]
    [Route("api/contents")]
    public class ContentController : ControllerBase
    {
        private readonly JsonDataService<ContentEntry> _service = new(
            "Data/contents.json",
            c => c.Id,
            (c, id) => c.Id = id
        );

        [HttpGet]
        public IActionResult GetAll() => Ok(_service.Load());

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var item = _service.Load().FirstOrDefault(c => c.Id == id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public IActionResult Add(ContentEntry content)
        {
            _service.Add(content);
            return Ok(content);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, ContentEntry updatedContent)
        {
            var list = _service.Load();
            var content = list.FirstOrDefault(c => c.Id == id);
            if (content == null) return NotFound();

            content.Text = updatedContent.Text;
            content.SubmenuId = updatedContent.SubmenuId;
            _service.Save(list);
            return Ok(content);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var list = _service.Load();
            var content = list.FirstOrDefault(c => c.Id == id);
            if (content == null) return NotFound();

            list.Remove(content);
            _service.Save(list);
            return NoContent();
        }
    }

}
