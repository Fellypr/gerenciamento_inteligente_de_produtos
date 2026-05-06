using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace back_end.model
{
    public class Produtos
    {
        public string NomeProduto { get; set; }
        public string Marca { get; set; }
        public string CodigoBarra { get; set; }
        public int Unidade { get; set; }
        public decimal PrecoRevista { get; set; }
        public decimal PrecoAdquirido { get; set; }
        public decimal PrecoVista { get; set; }
    }
}