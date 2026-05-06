using Npgsql;

namespace back_end.Infrastructure;

public interface IDbConnectionFactory
{
    NpgsqlConnection GetConnection();
}