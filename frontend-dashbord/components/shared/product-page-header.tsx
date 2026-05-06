import { Package } from "lucide-react"

export function ProductPageHeader() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Package className="w-4 h-4 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
          Adicionar produto
        </h1>
      </div>
      <p className="text-sm text-muted-foreground pl-10.5">
        Cadastre produtos manualmente ou via código de 14 dígitos com exportação para Excel.
      </p>
    </div>
  )
}
