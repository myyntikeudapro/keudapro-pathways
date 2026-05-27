import { ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail, ExternalLink } from "lucide-react";

type Props = {
  programLabel: string;
  trigger: ReactNode;
};

/**
 * Avaa pop-upin, joka kertoo että valmennustarjotinta päivitetään
 * ja ohjaa olemaan yhteydessä Keudaan (Ulla Liukkonen).
 */
export function ProgramUpdateDialog({ programLabel, trigger }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Räätälöimme ratkaisun organisaation ja yksilön tarpeesta
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-2 leading-relaxed space-y-3">
            <span className="block">
              <strong className="text-foreground">{programLabel}</strong> on osa
              uudistuvaa KeudaPRO:n johtamisen ja esihenkilötyön
              valmennustarjotinta, jota päivitämme parhaillaan.
            </span>
            <span className="block">
              Lähtökohtana ovat aina <strong className="text-foreground">organisaation
              tai yksilön omasta tarpeesta nousevat johtamisen ja esihenkilötyön
              ratkaisut</strong>. Olemme toteuttaneet näitä laajasti julkisella
              puolella – mm. Helsingin kaupungille, KUUMA-alueen kunnille sekä eri
              sote-alueille – ja yksityisille organisaatioille.
            </span>
            <span className="block">
              Yhdistämme luontevasti työyhteisön ja yksilön tarpeet samaan
              kokonaisuuteen: osalle osallistujista <strong className="text-foreground">osa-
              tai kokotutkintoja</strong>, osalle <strong className="text-foreground">tiimi-
              ja työyhteisövalmennuksia</strong> useista eri johtamisen teemoista.
              Rakennamme paketin, joka palvelee sekä yksilön kasvua että yhteisön
              kehittymistä.
            </span>
            <span className="block">
              Jos haluat kuulla lisää tai keskustella oman organisaationne
              tarpeista ja tutkintokoulutuksista, ole yhteydessä:
            </span>
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
