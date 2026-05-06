"use client";
import { useContext } from "react";
import { ProdutosContext } from "@/context/produtos-context";

export const useProdutos = () => {
    const context = useContext(ProdutosContext);
    if (!context) {
        throw new Error("useProdutos must be used within ProdutosProvider");
    }
    return context;
}
    