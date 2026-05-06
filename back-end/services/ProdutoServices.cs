using back_end.services.Interfaces;
using back_end.model;
using back_end.Infrastructure;
using back_end.repositories.interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Diagnostics;
using back_end.Dtos;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using back_end.Hubs;

namespace back_end.services
{
    public class ProdutoServices : IProdutosServices
    {
        private readonly IDbConnectionFactory _dbConnectionFactory;
        private readonly IHubContext<ScrapingHub> _hubContext;
        private readonly IProdutoRepository _produtoRepository;

        public ProdutoServices(IDbConnectionFactory dbConnectionFactory, IHubContext<ScrapingHub> hubContext, IProdutoRepository produtoRepository)
        {
            _dbConnectionFactory = dbConnectionFactory;
            _hubContext = hubContext;
            _produtoRepository = produtoRepository;
        }
        public async Task<string> InciarScraping(CodigoDeAcessoDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.ChaveAcesso) || dto.ChaveAcesso.Length != 44)
                {
                    return "Chave de Acesso inválida";
                }
                ProcessStartInfo start = new ProcessStartInfo{
                    FileName = "/home/fellype/Documentos/Projetos/adicionarProductFullstack/Estudos_de_python/venv/bin/python",
                    Arguments = "main.py " + dto.ChaveAcesso,
                    WorkingDirectory = "/home/fellype/Documentos/Projetos/adicionarProductFullstack/Estudos_de_python",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                };
                using var process = new Process { StartInfo = start };
                StringBuilder jsonAcumulado = new StringBuilder();
                process.ErrorDataReceived += async (sender, e) =>
                {
                    if (!string.IsNullOrEmpty(e.Data))
                    {
                        Console.WriteLine(e.Data);
                        if (!string.IsNullOrEmpty(dto.ConnectionId))
                        {
                            await _hubContext.Clients.Client(dto.ConnectionId).SendAsync("ReceiveLog", e.Data);
                        }
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
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var produtos = JsonSerializer.Deserialize<List<ProdutosDto>>(jsonAcumulado.ToString(), options);
                if(produtos == null || !produtos.Any())
                {
                    return "Nenhum produto encontrado para a chave de acesso informada";
                }
                
                return JsonSerializer.Serialize(produtos, options);

            }catch(Exception ex)
            {
               return $"Erro ao iniciar scraping: {ex.Message}";
            }

        }
        public async Task<List<ProdutosDto>> VerificarStatusDosProdutos(List<ProdutosDto> produtos)
        {
            try
            {
                foreach (var produto in produtos)
                {
                    var produtoExistente = await _produtoRepository.GetByCodigoBarraAsync(produto.CodigoBarra);
                    if (produtoExistente != null)
                    {
                        produto.Status = "Ja existe";
                        produto.NomeProduto = produtoExistente.NomeProduto;
                        produto.PrecoAdquirido = produtoExistente.PrecoAdquirido;
                        produto.PrecoRevista = produtoExistente.PrecoRevista;
                        produto.Unidade = produtoExistente.Unidade + produto.Unidade;
                        produto.UnidadeAdicionada = produto.Unidade;
                        produto.PrecoVista = produtoExistente.PrecoVista;
                    }
                    else
                    {
                        produto.Status = "Novo";
                        produto.NomeProduto = produto.NomeProduto.Trim().ToUpper();
                        produto.UnidadeAdicionada = 0;
                    }
                }
                return produtos;
            }
            catch (Exception ex)
            {
                throw new Exception("Erro ao verificar produtos" + ex.Message);
            }
        }
        public async Task<string> AdicionandoProdutos(List<ProdutosDto> produtos)
        {
            int atualizados = 0;
            int adicionados = 0;
            try
            {
                foreach(var produto in produtos)
                {
                    var produtoExistente = await _produtoRepository.GetByCodigoBarraAsync(produto.CodigoBarra);
                    if(produtoExistente != null)
                    {
                        await _produtoRepository.UpdateUnidadeProdutoAsync(produto);
                        atualizados++;
                    }
                    else
                    {
                        await _produtoRepository.CreateProductAsync(produto);
                        adicionados++;
                    }   
                }
                return $"Foram atualizados {atualizados} produtos e adicionados {adicionados} produtos";
            }
            catch (Exception ex)
            {
                return "Erro ao adicionar produtos" + ex.Message;
            }
        }
    }
}