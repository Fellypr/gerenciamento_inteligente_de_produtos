using back_end.model;
using back_end.Dtos;

namespace back_end.services.Interfaces;

public interface IProdutosServices
{
    Task<string> InciarScraping(CodigoDeAcessoDto dto);
    Task<List<ProdutosDto>> VerificarStatusDosProdutos(List<ProdutosDto> produtos);
    Task<string> AdicionandoProdutos(List<ProdutosDto> produtos);
}