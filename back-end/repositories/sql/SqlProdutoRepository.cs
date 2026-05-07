using back_end.Dtos;
using back_end.repositories.interfaces;
using back_end.Infrastructure;
using Npgsql;

namespace back_end.repositories.sql;

public class SqlProdutoRepository : IProdutoRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public SqlProdutoRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<ProdutosDto?> GetByCodigoBarraAsync(string codigoDeBarras)
    {
        using var connection = _connectionFactory.GetConnection();
        await connection.OpenAsync();
        try
        {
            const string query = @"SELECT * FROM ""ProdutosCadastrados"" WHERE codigo_de_barra = @codigoDeBarras";
            using var command = new NpgsqlCommand(query, connection);
            command.Parameters.Add(new NpgsqlParameter("@codigoDeBarras", codigoDeBarras));
            using var reader = await command.ExecuteReaderAsync();
            if(await reader.ReadAsync())
            {
                
                return new ProdutosDto()
                {
                    NomeProduto = reader["produto"].ToString(),
                    CodigoBarra = reader["codigo_de_barra"].ToString(),
                    PrecoAdquirido = Convert.ToDecimal(reader["preco_adquirido"]),
                    PrecoRevista = Convert.ToDecimal(reader["preco_revista"]),
                    Unidade = Convert.ToInt32(reader["unidade"]),
                    PrecoVista = Convert.ToDecimal(reader["preco_adquirido"]),
                    ImagemUrl = reader["url_imagem"].ToString(),
                };
            }
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            throw;
        }
    }
    public async Task<int> CreateProductAsync(ProdutosDto produto)
    {
        using var connection = _connectionFactory.GetConnection();
        await connection.OpenAsync();
        try
        {
            const string query = @"INSERT INTO ""ProdutosCadastrados"" (codigo_de_barra, produto, preco_unitario, preco_revista, unidade,preco_adquirido, url_imagem) VALUES (@codigo,@produto,@preco_unitario,@preco_revista,@unidade,@preco_adquirido, @url_imagem)";
            using var command = new NpgsqlCommand(query, connection);
            command.Parameters.Add(new NpgsqlParameter("@codigo", produto.CodigoBarra));
            command.Parameters.Add(new NpgsqlParameter("@produto", produto.NomeProduto));
            command.Parameters.Add(new NpgsqlParameter("@preco_adquirido", produto.PrecoAdquirido));
            command.Parameters.Add(new NpgsqlParameter("@preco_unitario", produto.PrecoVista));
            command.Parameters.Add(new NpgsqlParameter("@preco_revista", produto.PrecoRevista));
            command.Parameters.Add(new NpgsqlParameter("@unidade", produto.Unidade));
            command.Parameters.Add(new NpgsqlParameter("@url_imagem", produto.ImagemUrl));
            
            return await command.ExecuteNonQueryAsync();


        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            throw;
        }
    }
    public async Task<int> UpdateUnidadeProdutoAsync(ProdutosDto produto)
    {
        using var connection = _connectionFactory.GetConnection();
        await connection.OpenAsync();
        try
        {
            const string query = @"UPDATE ""ProdutosCadastrados"" SET unidade = unidade + @unidadeNew WHERE codigo_de_barra = @codigoBarra";
            using var command = new NpgsqlCommand(query, connection);
            command.Parameters.Add(new NpgsqlParameter("@codigoBarra", produto.CodigoBarra));
            command.Parameters.Add(new NpgsqlParameter("@unidadeNew", produto.Unidade));
            return await command.ExecuteNonQueryAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            throw;
        }
    }
}