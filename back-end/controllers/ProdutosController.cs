using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using back_end.services.Interfaces;
using back_end.Dtos;

namespace back_end.controllers
{

    [Route("api/[Controller]")]
    [ApiController]
    public class ProdutosController : ControllerBase
    {
        private readonly IProdutosServices _produtoServices;

        public ProdutosController(IProdutosServices produtoServices)
        {
            _produtoServices = produtoServices;
        }

        [HttpPost("iniciar-scraping")]
        public async Task<IActionResult> IniciarScraping([FromBody] CodigoDeAcessoDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.ChaveAcesso))
                {
                    return BadRequest("Preencha a chave de acesso");
                }
                else if (dto.ChaveAcesso.Length != 44)
                {
                    return BadRequest("Chave de acesso deve ter 44 caracteres");
                }

                var resultado = await _produtoServices.InciarScraping(dto);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("verificar-produtos")]
        public async Task<IActionResult> VerificarProdutos([FromBody] List<ProdutosDto> produtos)
        {
            try
            {
                if (produtos == null || !produtos.Any())
                {
                    return BadRequest("Nenhum produto encontrado para verificar");
                }
                var resultado = await _produtoServices.VerificarStatusDosProdutos(produtos);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("adicionar-produtos")]
        public async Task<IActionResult> AdicionarProdutos([FromBody] List<ProdutosDto> produtos)
        {
            try
            {
                if (produtos == null || !produtos.Any())
                {
                    return BadRequest("Nenhum produto encontrado para adicionar");
                }
                var resultado = await _produtoServices.AdicionandoProdutos(produtos);
                if(resultado.Contains("Erro"))
                {
                    return BadRequest(resultado);
                }
                return Ok(new {message = resultado});
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Erro no sistema: " + ex.Message);
            }
        }
    }
}