export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-center gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm text-muted-foreground">
          Dados baseados na TibiaWiki BR &middot; Ultima sincronizacao: {new Date().toLocaleDateString("pt-BR")}
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Tibia e todas as imagens sao propriedade da CipSoft GmbH.
        </p>
      </div>
    </footer>
  );
}
