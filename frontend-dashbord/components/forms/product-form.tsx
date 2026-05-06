"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Package,
  DollarSign,
  Barcode,
  Hash,
  ShoppingCart,
  CreditCard,
  Tag,
  ImageIcon,
  CheckCircle,
  XCircle,
  Loader2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatBarcode, isValidUrl } from "@/lib/product-formatters"




export function ProductForm() {


  return (
    <form  className="space-y-6">
      


      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="nome" className="text-sm font-medium flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-muted-foreground" />
            Nome do produto
          </Label>
          <Input
            id="nome"
            placeholder="Ex: Smartphone Samsung Galaxy A54"
          />

        </div>


        <div className="space-y-1.5">
          <Label htmlFor="marca" className="text-sm font-medium flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
            Marca
          </Label>
          <Input
            id="marca"
            placeholder="Ex: Samsung"
          />

        </div>


        <div className="space-y-1.5">
          <Label htmlFor="codigoBarra" className="text-sm font-medium flex items-center gap-1.5">
            <Barcode className="w-3.5 h-3.5 text-muted-foreground" />
            Código de barras
          </Label>
          <Input
            id="codigoBarra"
            placeholder="Somente números"
          />
        </div>


        <div className="space-y-1.5">
          <Label htmlFor="quantidade" className="text-sm font-medium flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-muted-foreground" />
            Quantidade em estoque
          </Label>
          <Input
            id="quantidade"
            placeholder="0"
            inputMode="numeric"
          />
        </div>


        <div className="space-y-1.5">
          <Label htmlFor="preco" className="text-sm font-medium flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
            Preço de venda (R$)
          </Label>
          <Input
            id="preco"
            placeholder="0,00"
            inputMode="decimal"
          />
        </div>


        <div className="space-y-1.5">
          <Label htmlFor="precoCompra" className="text-sm font-medium flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground" />
            Preço de compra (R$)
          </Label>
          <Input
            id="precoCompra"
            placeholder="0,00"
            inputMode="decimal"
          />
        </div>


        <div className="space-y-1.5">
          <Label htmlFor="precoCrediario" className="text-sm font-medium flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
            Preço no crediário (R$)
          </Label>
          <Input
            id="precoCrediario"
            placeholder="0,00"
            inputMode="decimal"
          />
        </div>


        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="imagemUrl" className="text-sm font-medium flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
            URL da imagem
            <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
          </Label>
          <Input
            id="imagemUrl"
            placeholder="https://exemplo.com/imagem.jpg"
          />

        </div>



          <div className="md:col-span-2">
            <div className="relative w-full h-40 rounded-lg border border-border overflow-hidden bg-muted">
              <Image
                src=""
                alt="Preview do produto"
                fill
                className="object-contain"
                unoptimized
              />
              <button
                type="button"
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
                aria-label="Remover imagem"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Preview da imagem do produto</p>
          </div>


      </div>


      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        <Button
          type="button"
          variant="outline"
          
        >
          Cancelar
        </Button>
        <Button type="submit">
          Salvar produto
        </Button>
      </div>
    </form>
  )
}
