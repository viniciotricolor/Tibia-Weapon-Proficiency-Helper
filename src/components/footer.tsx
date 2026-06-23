import { Heart, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Info */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Tibia Weapon Proficiency Helper</h3>
            <p className="text-xs text-muted-foreground mb-2">
              Feito com <Heart className="inline h-3 w-3 text-red-500 fill-red-500" /> por{" "}
              <span className="font-medium text-foreground">Vinicio Tricolor</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Fansite nao oficial do Tibia. Todos os direitos do jogo pertencem a CipSoft GmbH.
            </p>
          </div>

          {/* Credits */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Creditos</h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>
                Dados:{" "}
                <a href="https://tibiawiki.com.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  TibiaWiki BR
                  <ExternalLink className="inline h-3 w-3 ml-0.5" />
                </a>
              </li>
              <li>Personagem: <span className="text-foreground">Vinicio Tricolor</span></li>
              <li>Feito para a comunidade Tibia</li>
            </ul>
          </div>

          {/* Donate */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Apoie o Projeto</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Se este site te ajudou, considere doar para o personagem{" "}
              <span className="font-medium text-foreground">Vinicio Tricolor</span> no Tibia!
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-4 py-2">
              <span className="text-sm font-bold text-primary">Vinicio Tricolor</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Qualquer valor e bem-vindo! Obrigado pelo apoio!
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-[10px] text-muted-foreground">
            Tibia e todas as imagens sao propriedade da CipSoft GmbH. &middot; Dados baseados na{" "}
            <a href="https://tibiawiki.com.br" target="_blank" rel="noopener noreferrer" className="hover:underline">
              TibiaWiki BR
            </a>{" "}
            &middot; Ultima sincronizacao: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>
    </footer>
  );
}
