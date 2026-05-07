


export interface CodigoDeAcesso{
  ChaveAcesso:string
  ConnectionId?: string
}



export interface ProdutoScrapingRaw {
  nomeProduto: string;
  codigoBarra: string;
  unidade: number;
  precoAdquirido: number;
  unidadeAdicionada?:number;
  precoRevista:number;
  precoVista:number;
  status?:string;
  imagemUrl?: string;
}

export type ProductExcelResponse = ProdutoScrapingRaw[];



