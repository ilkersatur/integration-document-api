using System.Text.Json;

namespace IntegrationDocumentApi.Data
{

    public class JsonDataService<T> where T : class
    {
        private readonly string _filePath;
        private readonly Func<T, int> _getId;
        private readonly Action<T, int> _setId;

        public JsonDataService(string filePath, Func<T, int> getId, Action<T, int> setId)
        {
            _filePath = filePath;
            _getId = getId;
            _setId = setId;
        }

        public List<T> Load()
        {
            if (!File.Exists(_filePath))
                return new List<T>();

            var json = File.ReadAllText(_filePath);
            return JsonSerializer.Deserialize<List<T>>(json) ?? new List<T>();
        }

        public void Save(List<T> data)
        {
            var json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_filePath, json);
        }

        public void Add(T item)
        {
            var list = Load();
            int nextId = list.Any() ? list.Max(_getId) + 1 : 1;
            _setId(item, nextId);
            list.Add(item);
            Save(list);
        }
    }
}
