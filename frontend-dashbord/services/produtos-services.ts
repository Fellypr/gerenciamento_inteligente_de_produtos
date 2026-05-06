import { promises } from "dns";
import { api } from "./api";
import type { CodigoDeAcesso, ProductExcelResponse, ProdutoScrapingRaw} from "@/types/product";

export const productServices = {
    postProductExcel: async (codigoDeAcesso: CodigoDeAcesso): Promise<ProdutoScrapingRaw[]> => {
        const { data } = await api.post<any>("/iniciar-scraping", codigoDeAcesso);


        if (typeof data === 'string') {
            try {
                return JSON.parse(data);
            } catch {

                throw new Error(data);
            }
        }
        
        return data;
    },
    postValidaProduto: async (produtos: any[]): Promise<ProdutoScrapingRaw[]> => {
        const { data } = await api.post<ProductExcelResponse>("/verificar-produtos", produtos)
        return data.map((item) => ({
            nomeProduto: item.nomeProduto,
            codigoBarra: item.codigoBarra,
            unidade: item.unidade,
            precoAdquirido: item.precoAdquirido,
            unidadeAdicionada: item.unidadeAdicionada,
            precoRevista: item.precoRevista,
            precoVista: item.precoVista,
            status: item.status,
        }));
    },
    postFinalizaImportacao: async (produtos: ProdutoScrapingRaw[]): Promise<string> => {
        const { data } = await api.post<ProductExcelResponse>("/adicionar-produtos", produtos)
        return "Produtos importados com sucesso";
    }
}
