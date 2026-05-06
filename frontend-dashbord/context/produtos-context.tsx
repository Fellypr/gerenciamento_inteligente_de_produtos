"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { productServices } from "@/services/produtos-services";
import type { ProdutoScrapingRaw } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import * as signalR from "@microsoft/signalr";

interface ProdutosContextType {
    adicionarProdutosExcel: (e?: React.FormEvent) => void;
    finalizaImportacao: (produtos: ProdutoScrapingRaw[]) => Promise<string>;
    limpaProdutos: () => void;
    loading: boolean;
    produtos: ProdutoScrapingRaw[];
    erro: string | null;
    mensagemCarregamento: string | null;
    codigoDeAcesso: string;
    setCodigoDeAcesso: (codigoDeAcesso: string) => void;
    setProdutos: (produtos: ProdutoScrapingRaw[]) => void;

}

export const ProdutosContext = createContext<ProdutosContextType | undefined>(undefined);

export const ProdutosProvider = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [produtos, setProdutos] = useState<ProdutoScrapingRaw[]>([]);
    const [erro, setErro] = useState<string | null>(null);
    const [mensagemCarregamento, setMensagemCarregamento] = useState<string | null>(null);
    const [codigoDeAcesso, setCodigoDeAcesso] = useState<string>("");
    const { toast } = useToast();
    const adicionarProdutosExcel = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);
        setErro(null);
        setMensagemCarregamento("Conectando ao servidor...");
        let connection: signalR.HubConnection | null = null;
        try {
            connection = new signalR.HubConnectionBuilder()
                .withUrl("http://localhost:5000/scrapingHub")
                .withAutomaticReconnect()
                .build();

            await connection.start();
            const connectionId = await connection.invoke<string>("GetConnectionId");

            connection.on("ReceiveLog", (mensagem: string) => {
                setMensagemCarregamento(mensagem);
            });

            const responseScraping = await productServices.postProductExcel({
                ChaveAcesso: codigoDeAcesso,
                ConnectionId: connectionId
            });
            if (Array.isArray(responseScraping) && responseScraping.length > 0) {
                await validaProduto(responseScraping);
                toast({
                    title: "Sucesso!",
                    description: "Produtos importados e prontos para uso.",
                });
            } else {
                setErro("Nenhum produto encontrado.");
                toast({
                    variant: "destructive",
                    title: "Atenção",
                    description: "Nenhum produto foi encontrado na consulta.",
                });
            }
        } catch (error) {

            const msgErro = error instanceof Error ? error.message : "Erro ao buscar produtos.";
            setErro(msgErro);
            toast({
                variant: "destructive",
                title: "Falha na Importação",
                description: msgErro,
            });
        } finally {
            if (connection) {
                await connection.stop();
            }
            setLoading(false);
            setMensagemCarregamento(null);
        }
    }
    async function validaProduto(produtos: any[]) {
        try {
            const response = await productServices.postValidaProduto(produtos);
            if (Array.isArray(response) && response.length > 0) {
                setProdutos(response);
                localStorage.setItem("produtos-importados", JSON.stringify(response));
                toast({
                    title: "Sucesso!",
                    description: "Produtos importados e prontos para uso.",
                });
            } else {
                setErro("Nenhum produto encontrado.");
                toast({
                    variant: "destructive",
                    title: "Atenção",
                    description: "Nenhum produto foi encontrado na consulta.",
                });
            }
        } catch (error) {

            const msgErro = error instanceof Error ? error.message : "Erro ao buscar produtos.";
            setErro(msgErro);
            toast({
                variant: "destructive",
                title: "Falha na Importação",
                description: msgErro,
            });
        }

    }
    async function finalizaImportacao(produtos: ProdutoScrapingRaw[]) {
        try {
            const response = await productServices.postFinalizaImportacao(produtos);
            toast({
                title: "Sucesso!",
                description: response,
            });
            limpaProdutos();
            return response;
        } catch (error) {

            toast({
                variant: "destructive",
                title: "Falha na Importação",
                description: "Erro ao buscar produtos.",
            });
            return "Erro ao buscar produtos.";
        }


    }
    function limpaProdutos(){
        localStorage.removeItem("produtos-importados");
        setProdutos([]);
        setCodigoDeAcesso("");
    }

    return (
        <ProdutosContext.Provider
            value={{
                setProdutos,
                limpaProdutos,
                adicionarProdutosExcel,
                loading,
                produtos,
                erro,
                mensagemCarregamento,
                codigoDeAcesso,
                setCodigoDeAcesso,
                finalizaImportacao
            }}
        >
            {children}
        </ProdutosContext.Provider>
    )

}