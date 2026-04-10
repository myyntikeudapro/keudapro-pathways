import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RegionalServices } from "@/components/noste/RegionalServices";
import { ServiceButtons } from "@/components/noste/ServiceModals";

type Tab = "regional" | "services";

interface PathServicesModalProps {
  open: boolean;
  onClose: () => void;
  serviceTabLabel: string;
  serviceHeading: string;
}

export function PathServicesModal({ open, onClose, serviceTabLabel, serviceHeading }: PathServicesModalProps) {
  const [tab, setTab] = useState<Tab>("regional");

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setTab("regional"); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 sm:rounded-xl">
        <div className="p-6 md:p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold">Palvelut ja väylät</DialogTitle>
            <DialogDescription className="sr-only">Valitse palvelukategoria</DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto mb-6 -mx-1 px-1">
            {([
              { id: "regional" as const, label: "Työhönvalmennus alueellasi" },
              { id: "services" as const, label: serviceTabLabel },
            ]).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                  tab === t.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-accent"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="transition-opacity duration-150">
            {tab === "regional" && <RegionalServices standalone />}
            {tab === "services" && <ServiceButtons heading={serviceHeading} standalone />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
