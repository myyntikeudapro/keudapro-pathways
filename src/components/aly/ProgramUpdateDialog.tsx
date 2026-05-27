import { ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail, Phone, ExternalLink } from "lucide-react";

type Props = {
  programLabel: string;
  trigger: ReactNode;
};

/**
 * Avaa pop-upin, joka kertoo että valmennustarjotinta päivitetään
 * ja ohjaa olemaan yhteydessä Keudaan (Heikki Kallunki).
 */
export function ProgramUpdateDialog({ programLabel, trigger }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            Räätälöimme ratkaisun tarpeen mukaan
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-2 leading-relaxed space-y-2">
            <span className="block">
              <strong className="text-foreground">{programLabel}</strong> on osa
              KeudaPRO:n johtamisen valmennustarjotinta, jota päivitämme parhaillaan.
            </span>
            <span className="block">
              Lähtökohtana ovat aina <strong className="text-foreground">organisaation tai yksilön tarpeet</strong>.
              Toteutamme ratkaisuja mm. Helsingin kaupungille, KUUMA-kunnille, sote-alueille ja yksityisille.
            </span>
            <span className="block">
              Yhdistämme <strong className="text-foreground">osa- ja kokotutkintoja</strong> sekä
              <strong className="text-foreground"> tiimi- ja työyhteisövalmennuksia</strong> yhdeksi paketiksi.
            </span>
            <span className="block">Kiinnostuitko? Ole yhteydessä:</span>
          </DialogDescription>
        </DialogHeader>


        <div className="mt-2 rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-sm font-semibold text-foreground">Ulla Liukkonen</p>
          <p className="text-xs text-muted-foreground mb-3">
            Johtamisen koulutukset, Keuda
          </p>
          <a
            href="mailto:ulla.liukkonen@keuda.fi"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Mail className="w-4 h-4" />
            ulla.liukkonen@keuda.fi
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <a
            href="https://www.keuda.fi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md text-sm font-semibold border border-border bg-background hover:bg-muted transition-colors"
          >
            Keuda.fi
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center h-10 px-4 rounded-md text-sm font-semibold bg-foreground text-background hover:bg-foreground/85 transition-colors"
          >
            Sulje
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
