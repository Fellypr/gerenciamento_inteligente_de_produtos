using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

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
        static async Task Main() {
            ProcessStartInfo start = new ProcessStartInfo{
                FileName = "python3",
                Arguments = "-c \"import sys; import time; import json; print('logs to stderr', file=sys.stderr); print(json.dumps([{'NomeProduto': 'A', 'Unidade': 1, 'CodigoBarra': '123'}]), flush=True)\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };
            using var process = new Process { StartInfo = start };
            StringBuilder jsonAcumulado = new StringBuilder();
            
            process.ErrorDataReceived += (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data))
                {
                    Console.WriteLine("STDERR: " + e.Data);
                }
            };
            process.OutputDataReceived += (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data))
                {
                    jsonAcumulado.Append(e.Data);
                }
            };
            
            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();
            await process.WaitForExitAsync();
            
            Console.WriteLine("JSON ACUMULADO: " + jsonAcumulado.ToString());
            
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var produtos = JsonSerializer.Deserialize<List<ProdutosDto>>(jsonAcumulado.ToString(), options);
            if(produtos == null || !produtos.Any())
            {
                Console.WriteLine("Nenhum produto");
                return;
            }
            Console.WriteLine("Produtos Count: " + produtos.Count);
            Console.WriteLine("Serialize back: " + JsonSerializer.Serialize(produtos, options));
        }
    }
}
