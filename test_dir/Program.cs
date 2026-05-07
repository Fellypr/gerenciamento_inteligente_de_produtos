using System;
using System.Collections.Generic;
using System.Text.Json;

namespace test {
    public class ProdutosDto
    {
        public string NomeProduto { get; set; }
        public string CodigoBarra { get; set; }
        public int Unidade { get; set; }
        public int? UnidadeAdicionada{get; set;}
        public decimal PrecoAdquirido { get; set; }
        public decimal PrecoRevista { get; set; }
        public decimal PrecoVista { get; set; }
        public string? Status { get; set; }
        public string? ImagemUrl { get; set; }
    }
    
    class Program {
        static void Main() {
            string json = @"[{""NomeProduto"": ""TESTE"", ""Unidade"": 1, ""PrecoVista"": 1.15, ""PrecoRevista"": 1.5, ""PrecoAdquirido"": 1.0, ""CodigoBarra"": ""123"", ""ImagemURL"": ""http""}]";
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            try {
                var produtos = JsonSerializer.Deserialize<List<ProdutosDto>>(json, options);
                Console.WriteLine("Deserialized count: " + produtos.Count);
                Console.WriteLine("ImagemUrl: " + produtos[0].ImagemUrl);
            } catch (Exception ex) {
                Console.WriteLine("Error: " + ex.ToString());
            }
        }
    }
}
