namespace back_end.Dtos;
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
}