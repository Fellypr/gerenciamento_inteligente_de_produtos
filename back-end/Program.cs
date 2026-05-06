using back_end.services.Interfaces;
using back_end.services;
using back_end.model;
using back_end.Dtos;
using back_end.Infrastructure;
using back_end.repositories.interfaces;
using back_end.repositories.sql;
using back_end.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        policy
         .WithOrigins("http://localhost:3000")
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials();
    });
});

builder.Services.AddScoped<IProdutoRepository, SqlProdutoRepository>();

builder.Services.AddScoped<IProdutosServices, ProdutoServices>();
builder.Services.AddScoped<IDbConnectionFactory, SqlConnectionFactory>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger(c =>
{
    c.RouteTemplate = "swagger/{documentName}/swagger.json";
});

app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Minha API v1");
    c.RoutePrefix = "swagger";
});

app.UseRouting();
app.UseCors("PermitirFrontend");
app.UseAuthorization();
app.MapControllers();
app.MapHub<ScrapingHub>("/scrapingHub");

app.Run();
