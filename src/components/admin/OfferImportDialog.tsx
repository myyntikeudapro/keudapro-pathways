import { importedCustomerHref } from '@/lib/workspaceNextStep';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, FileUp, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BILLING_LABELS, FIELD_LABELS, IMPORT_FIELDS, buildImportCommand, fieldsToValues, importErrorMessage, normalizeExtraction, validateForm, type ImportFieldKey, type ImportFields } from '@/lib/offerImport';

type LeadOption = { id: string; name: string; organization: string | null };
const MAX_TEXT = 60000;

async function pdfText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= Math.min(doc.numPages, 30); i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map(it => ('str' in it ? it.str + (it.hasEOL ? '\n' : ' ') : '')).join(''));
  }
  return pages.join('\n\n');
}

const defaultClose = () => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().slice(0, 10); };

export function OfferImportDialog({ leads, onImported }: { leads: LeadOption[]; onImported: () => void }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [email, setEmail] = useState('');
  const [pdf, setPdf] = useState<{ name: string; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<ImportFields | null>(null);
  const [values, setValues] = useState<Record<ImportFieldKey, string> | null>(null);
  const [leadId, setLeadId] = useState('');
  const [expectedClose, setExpectedClose] = useState(defaultClose());
  const [opKey, setOpKey] = useState(() => crypto.randomUUID());
  const source = [pdf ? `--- Tarjous (${pdf.name}) ---\n${pdf.text}` : '', email.trim() ? `--- Sähköpostikeskustelu ---\n${email.trim()}` : ''].filter(Boolean).join('\n\n');

  const reset = () => { setStep('input'); setEmail(''); setPdf(null); setFields(null); setValues(null); setLeadId(''); setExpectedClose(defaultClose()); setOpKey(crypto.randomUUID()); };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.type !== 'application/pdf' || file.size > 10 * 1024 * 1024) return toast.error('Valitse enintään 10 Mt:n PDF-tiedosto.');
    setBusy(true);
    try {
      const text = (await pdfText(file)).trim();
      if (!text) toast.error('PDF:stä ei löytynyt tekstiä. Liitä tarjouksen teksti käsin.');
      else setPdf({ name: file.name, text });
    } catch { toast.error('PDF:n lukeminen epäonnistui.'); }
    setBusy(false);
  };

  const extract = async () => {
    if (source.length < 20) return toast.error('Liitä sähköpostiketju tai lataa tarjous-PDF.');
    if (source.length > MAX_TEXT) return toast.error('Teksti on liian pitkä (enintään 60 000 merkkiä).');
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('offer-import-extract', { body: { text: source } });
    setBusy(false);
    if (error || !data?.fields) {
      let msg = 'Poiminta epäonnistui. Voit täyttää tiedot käsin.';
      try { const body = await (error as { context?: Response })?.context?.json(); if (body?.error) msg = body.error; } catch { /* keep default */ }
      toast.error(msg);
      const blank = normalizeExtraction({}, source);
      setFields(blank); setValues(fieldsToValues(blank)); setStep('review');
      return;
    }
    const norm = normalizeExtraction(data.fields, source);
    setFields(norm); setValues(fieldsToValues(norm)); setStep('review');
  };

  const confirm = async () => {
    if (!values) return;
    const form = { leadId: leadId || null, values, expectedClose, serviceKey: null, sourceText: source };
    const check = validateForm(form);
    if (!check.ok) return toast.error(check.errors.join(' · '));
    setBusy(true);
    const cmd = buildImportCommand(form, opKey);
    const { data, error } = await supabase.rpc(cmd.rpc, cmd.args);
    setBusy(false);
    if (error) return toast.error(importErrorMessage(error.message));
    const res = data as { organization_id?: string; lead_id?: string; offer_id?: string };
    toast.success('Tiedot kirjattu: asiakas, tarjousluonnos ja alkuperäinen teksti historiaan. Tilausta ei vahvistettu.');
    onImported(); setOpen(false); reset();
    const destination = importedCustomerHref(res);
    if (destination) navigate(destination);
  };

  const setValue = (k: ImportFieldKey, v: string) => setValues(prev => (prev ? { ...prev, [k]: v } : prev));

  return <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o && !busy) reset(); }}>
    <DialogTrigger asChild><Button variant="secondary" size="sm"><Sparkles className="mr-2 h-4 w-4" />Tuo tarjous tai keskustelu</Button></DialogTrigger>
    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Tuo tarjous tai keskustelu</DialogTitle>
        <DialogDescription>Tekoäly ehdottaa tiedot, sinä tarkistat ja vahvistat. Mitään ei tallenneta ennen vahvistusta. Tuonti ei koskaan merkitse kauppaa voitetuksi, vahvista tilausta, lähetä viestejä tai käynnistä laskutusta.</DialogDescription>
      </DialogHeader>
      {step === 'input' ? <div className="space-y-4">
        <div className="space-y-2"><Label htmlFor="import-email">Sähköpostiketju tai muu teksti</Label><Textarea id="import-email" rows={10} maxLength={MAX_TEXT} placeholder="Liitä tähän sähköpostikeskustelu tai tarjouksen teksti" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="import-pdf">Tarjous-PDF (luetaan selaimessa, tiedostoa ei tallenneta)</Label><Input id="import-pdf" type="file" accept="application/pdf" disabled={busy} onChange={e => onFile(e.target.files?.[0])} />{pdf && <p className="text-xs text-muted-foreground">Luettu: {pdf.name} · {pdf.text.length.toLocaleString('fi-FI')} merkkiä</p>}</div>
        <div className="flex justify-end"><Button onClick={extract} disabled={busy || source.length < 20}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}Poimi tiedot</Button></div>
      </div> : values && fields && <div className="space-y-4">
        <p className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />Tarkista jokainen kenttä. Korostetut kentät ovat epävarmoja, tyhjät puuttuvat lähteestä. Asiakas tunnistetaan Y-tunnuksella.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {IMPORT_FIELDS.map(k => {
            const f = fields[k]; const uncertain = f.value !== null && f.confidence === 'epavarma';
            return <div key={k} className={`space-y-1 rounded-md border p-2 ${uncertain ? 'border-amber-400 bg-amber-50' : ''} ${k === 'approval_evidence' ? 'sm:col-span-2' : ''}`} data-field={k}>
              <Label htmlFor={`f-${k}`} className="flex items-center justify-between gap-2 text-xs"><span>{FIELD_LABELS[k]}</span>{uncertain ? <span className="text-amber-800">Epävarma</span> : f.value === null ? <span className="text-muted-foreground">Ei löytynyt</span> : null}</Label>
              {k === 'billing_mode' ? <select id={`f-${k}`} className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={values[k]} onChange={e => setValue(k, e.target.value)}><option value="">Ei tiedossa</option><option value="start">{BILLING_LABELS.start}</option><option value="end">{BILLING_LABELS.end}</option><option value="installments">{BILLING_LABELS.installments}</option></select>
                : k === 'approved' ? <select id={`f-${k}`} className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={values[k]} onChange={e => setValue(k, e.target.value)}><option value="">Ei tiedossa</option><option value="kyllä">Kyllä (ehdotus)</option><option value="ei">Ei</option></select>
                : <Input id={`f-${k}`} value={values[k]} onChange={e => setValue(k, e.target.value)} />}
              {f.quote && <p className="text-xs italic text-muted-foreground">Lähde: ”{f.quote}”</p>}
            </div>;
          })}
        </div>
        {values.approved === 'kyllä' && <p className="text-sm text-muted-foreground">Hyväksyntä kirjataan vain ehdotuksena asiakkaan historiaan. Tarjousversion hyväksyntä ja tilauksen vahvistus tehdään erikseen.</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1"><Label htmlFor="import-lead" className="text-xs">Liitä olemassa olevaan yhteydenottoon (valinnainen)</Label><select id="import-lead" className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={leadId} onChange={e => setLeadId(e.target.value)}><option value="">Luo uusi yhteydenotto</option>{leads.map(l => <option key={l.id} value={l.id}>{l.name}{l.organization ? ` – ${l.organization}` : ''}</option>)}</select></div>
          <div className="space-y-1"><Label htmlFor="import-close" className="text-xs">Arvioitu päätöspäivä</Label><Input id="import-close" type="date" value={expectedClose} onChange={e => setExpectedClose(e.target.value)} /></div>
        </div>
        <div className="flex flex-wrap justify-between gap-2"><Button variant="outline" disabled={busy} onClick={() => setStep('input')}>Takaisin</Button><Button onClick={confirm} disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Vahvista ja kirjaa</Button></div>
      </div>}
    </DialogContent>
  </Dialog>;
}
