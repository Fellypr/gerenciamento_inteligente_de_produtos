

import type { CodigoDeAcessoDto} from './types.ts';

export type postApiProdutosIniciarScrapingResponse200 = {
  data: void
  status: 200
}
    
export type postApiProdutosIniciarScrapingResponseSuccess = (postApiProdutosIniciarScrapingResponse200) & {
  headers: Headers;
};
;

export type postApiProdutosIniciarScrapingResponse = (postApiProdutosIniciarScrapingResponseSuccess)

export const getPostApiProdutosIniciarScrapingUrl = () => {

  return `http://localhost:5000/api/Produtos/iniciar-scraping`
}

export const postApiProdutosIniciarScraping = async (codigoDeAcessoDto: CodigoDeAcessoDto, options?: RequestInit): Promise<postApiProdutosIniciarScrapingResponse> => {
  
  const res = await fetch(getPostApiProdutosIniciarScrapingUrl(),
  {      
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(
      codigoDeAcessoDto,)
  }
)

  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  
  const data: postApiProdutosIniciarScrapingResponse['data'] = body ? JSON.parse(body) : {}
  return { data, status: res.status, headers: res.headers } as postApiProdutosIniciarScrapingResponse
}
