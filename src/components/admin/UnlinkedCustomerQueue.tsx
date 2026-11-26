import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CustomerLinkDialog } from '@/components/admin/CustomerLinkDialog';
import { leadHref, serviceLabel, shortDate, type CustomerLead } from '@/lib/customerRegister';

export function UnlinkedCustomerQueue({ leads, person }: { leads: CustomerLead[]; person: (id: string | null) => string }) {
  const [search, setSearch] = useState(''); const [notice, setNotice] = useState('');
  const visible = leads.filter(l => `${l.name} ${l.organization ?? ''}`.toLocaleLowerCase('fi').includes(search.trim().toLocaleLowerCase('fi')));
  return <section aria-label="Liittämättömät yhteydenotot" className="space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl text-keuda-navy-section">Liittämättömät yhteydenotot</h2><p className="mt-1 text-sm text-muted-foreground">Organisaatiolinkki vahvistamatta · {leads.length.toLocaleString('fi-FI')} yhteydenottoa</p></div><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" aria-label="Hae liittämätöntä yhteydenottoa" placeholder="Nimi tai ilmoitettu organisaatio" value={search} onChange={e => setSearch(e.target.value)} /></div></div>
    {notice && <p role="status" className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">{notice}</p>}
    {visible.length === 0 ? <p className="border-y py-10 text-sm text-muted-foreground">{leads.length ? 'Ei hakua vastaavia yhteydenottoja.' : 'Ei liittämättömiä yhteydenottoja.'}</p> : <div className="divide-y border-y">{visible.map(l => <div key={l.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0 space-y-1"><h3 className="break-words text-base">{l.name}</h3><p className="break-words text-sm text-muted-foreground">Ilmoitettu organisaatio: {l.organization || 'Ei ilmoitettu'}</p><p className="break-words text-xs text-muted-foreground">{shortDate(l.created_at)} · {serviceLabel(l.service_key)} · Myyntivastuu {person(l.owner_id)}</p><Badge variant="outline">Myyntivaihe: {l.status}</Badge></div><div className="flex flex-wrap gap-2 self-start sm:shrink-0"><CustomerLinkDialog lead={l} label="Liitä organisaatioon" onLinked={() => setNotice(`${l.name} liitettiin organisaatioon. Se löytyy nyt organisaation asiakaskortilta.`)} /><Button asChild variant="outline" size="sm"><Link to={leadHref(l.id)}>Tarkastele yhteydenottoa<ArrowUpRight className="ml-2 h-4 w-4" /></Link></Button></div></div>)}</div>}
  </section>;
}