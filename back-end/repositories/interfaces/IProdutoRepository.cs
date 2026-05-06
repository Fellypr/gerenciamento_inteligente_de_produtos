using back_end.Dtos;

namespace back_end.repositories.interfaces;

public interface IProdutoRepository
{
    Task<int> CreateProductAsync(ProdutosDto produto);
    Task<int> UpdateUnidadeProdutoAsync(ProdutosDto produto);
    Task<ProdutosDto?> GetByCodigoBarraAsync(string codigoDeBarras);
}