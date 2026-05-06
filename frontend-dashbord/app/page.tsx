"use client"

import { useState } from "react"
import { PenLine, FileSpreadsheet, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductPageHeader } from "@/components/shared/product-page-header"
import { ProductForm } from "@/components/forms/product-form"
import { ProductExcelForm } from "@/components/forms/product-excel-form"
import { ThemeToggle } from "@/components/shared/theme-toggle"

type ActiveTab = "manual" | "excel"
type ModalState = "closed" | "choosing" | ActiveTab

export default function Page() {
  const [modal, setModal] = useState<ModalState>("closed")

  function openChoosing() {
    setModal("choosing")
  }

  function selectTab(tab: ActiveTab) {
    setModal(tab)
  }

  function closeModal() {
    setModal("closed")
  }

  return (
    <div className="min-h-screen bg-background">

      <header className="h-14 border-b border-border flex items-center justify-between px-6">
        <span className="text-sm font-semibold text-foreground tracking-tight">Catálogo</span>
        <ThemeToggle />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <ProductPageHeader />


        <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-medium text-foreground">Novo produto</h2>
            <p className="text-sm text-muted-foreground">
              Escolha como deseja cadastrar o produto no sistema.
            </p>
          </div>
          <Button onClick={openChoosing} size="lg" className="w-full sm:w-auto cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar produto
          </Button>
        </div>
      </main>


      {modal !== "closed" && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
        >

          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
            aria-hidden="true"
          />


          <div className={`relative z-10 w-full bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh] ${modal === "excel" ? "sm:max-w-5xl" : "sm:max-w-xl"}`}>

            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              {modal === "choosing" ? (
                <div>
                  <h2 className="text-base font-semibold text-foreground">Como deseja adicionar?</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Escolha o método de cadastro</p>
                </div>
              ) : (
                <div className="flex items-center gap-2">

                  <button
                    onClick={() => setModal("manual")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      modal === "manual"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    Manual
                  </button>
                  <button
                    onClick={() => setModal("excel")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      modal === "excel"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Excel
                  </button>
                </div>
              )}
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>


            <div className="overflow-y-auto p-6 flex-1">
              {modal === "choosing" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => selectTab("manual")}
                    className="group rounded-xl border-2 border-border bg-background p-5 text-left hover:border-primary/40 hover:bg-muted/30 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3 group-hover:bg-muted/80 transition-colors">
                      <PenLine className="w-5 h-5 text-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Adicionar manualmente</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Preencha nome, preço, código de barras e demais informações.
                    </p>
                  </button>

                  <button
                    onClick={() => selectTab("excel")}
                    className="group rounded-xl border-2 border-border bg-background p-5 text-left hover:border-primary/40 hover:bg-muted/30 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3 group-hover:bg-muted/80 transition-colors">
                      <FileSpreadsheet className="w-5 h-5 text-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Importar via Excel</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Digite um código de 44 dígitos e exporte os dados para planilha.
                    </p>
                  </button>
                </div>
              ) : modal === "manual" ? (
                <ProductForm />
              ) : (
                <ProductExcelForm />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
