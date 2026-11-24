import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Send, Check, Undo2 } from 'lucide-react';
import type { Programme } from '@/lib/companyTraining';

// Prepared UI boundary: not mounted until approved database checkpoints are available.
// Callbacks must use authenticated server checkpoints, never localStorage or direct table writes.
export type CompanyProgrammeActions = {
  saveDraft: (programme: Programme, expectedRevision: number) => Promise<void>;
  submit: (expectedRevision: number) => Promise<void>;
  respond: (accept: boolean, reason: string, expectedRevision: number) => Promise<void>;
};
export function CompanyProgrammeEditor({ programme, revision, actions, canPrepare, canReceive, missing }: {
  programme: Programme; revision: number; actions: CompanyProgrammeActions;
  canPrepare: boolean; canReceive: boolean; missing: string[];
}) {
  const [text, setText] = useState(programme.text);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const changed = text !== programme.text;
  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true); setError(''); setResult('');
    try { await action(); setResult(success); }
    catch { setError('Toiminto epäonnistui. Tarkista oikeudet ja voimassa oleva ohjelmaversio.'); }
    finally { setBusy(false); }
  };
  return <section className="space-y-4 border-t py-4">
    <header className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-semibold">Yrityskoulutuksen ohjelma</h3>
      <span className="text-sm text-muted-foreground">Versio {programme.version} · revisio {revision}</span>
    </header>
    <div className="grid gap-3 sm:grid-cols-2">
      <div><label htmlFor="company-programme-customer" className="text-sm">Asiakas</label><Input id="company-programme-customer" value={programme.customer} readOnly /></div>
      <div><label htmlFor="company-programme-year" className="text-sm">Vuosi</label><Input id="company-programme-year" value={programme.year} readOnly /></div>
    </div>
    <div><label htmlFor="company-programme-content" className="text-sm">Ohjelma ja asiakkaalle luvattu sisältö</label>
      <Textarea id="company-programme-content" rows={8} value={text} maxLength={20000} disabled={!canPrepare || busy} onChange={event => setText(event.target.value)} /></div>
    {missing.length > 0 && <ul className="space-y-1 text-sm text-destructive">{missing.map((item,index) => <li key={`${index}:${item}`}>{item}</li>)}</ul>}
    {canPrepare && <div className="flex flex-wrap gap-2">
      <Button disabled={busy || !changed} onClick={() => run(() => actions.saveDraft({...programme,text}, revision), 'Ohjelmaluonnos tallennettu')}><Save />Tallenna luonnos</Button>
      <Button variant="outline" disabled={busy || changed || missing.length > 0} onClick={() => run(() => actions.submit(revision), 'Luovutettu tuotannon tarkistukseen')}><Send />Lähetä tuotantoon</Button>
    </div>}
    {canReceive && <div className="space-y-2">
      <div><label htmlFor="company-return-reason" className="text-sm">Palautuksen syy</label><Textarea id="company-return-reason" value={reason} maxLength={2000} onChange={event => setReason(event.target.value)} /></div>
      <div className="flex flex-wrap gap-2">
        <Button disabled={busy || changed || missing.length > 0} onClick={() => run(() => actions.respond(true, '', revision), 'Toteutus vastaanotettu')}><Check />Vastaanota toteutus</Button>
        <Button variant="outline" disabled={busy || !reason.trim()} onClick={() => run(() => actions.respond(false, reason.trim(), revision), 'Palautettu täydennettäväksi')}><Undo2 />Palauta täydennettäväksi</Button>
      </div>
    </div>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {result && <p role="status" className="text-sm">{result}</p>}
  </section>;
}