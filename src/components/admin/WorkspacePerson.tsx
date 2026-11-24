import { useState, useSyncExternalStore } from 'react';
import { UserRound, Camera, RotateCcw, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AVATAR_STYLES, avatarSource, type AvatarStyle, type AvatarPreference, type WorkspacePersonData } from '@/lib/workspaceAvatar';

const key = 'keudapro:workspace-avatars:v1';
let preferences: Record<string, AvatarPreference> | undefined;
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
const empty: Record<string, AvatarPreference> = {};
function snapshot() {
  if (!preferences) { try { preferences = JSON.parse(localStorage.getItem(key) ?? '{}'); } catch { preferences = {}; } }
  return preferences ?? empty;
}
function save(id: string, value: AvatarPreference) {
  const next = { ...snapshot(), [id]: value };
  localStorage.setItem(key, JSON.stringify(next)); preferences = next; listeners.forEach(fn => fn());
}
export function AvatarPortrait({ style }: { style: AvatarStyle }) {
  return <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
    <path d="M10 64c1-16 10-23 22-23s21 7 22 23" fill="currentColor" />
    <path d="M26 38h12v12c-3 4-9 4-12 0z" className="fill-ws-avatar-skin" />
    <ellipse cx="32" cy="27" rx="14" ry="17" className="fill-ws-avatar-skin" />
    <path d={style === 'crop' ? 'M18 23c-2-17 27-22 29 0L40 17l-9 2-9-2z' : style === 'wave' ? 'M17 29C7 4 47 0 48 22l-6-6c-4 8-14 6-20 5z' : 'M17 28C9 6 49 0 48 27l-7-9c-7 5-16 2-21 1z'} className="fill-ws-avatar-ink" />
    <circle cx="27" cy="28" r="1.4" className="fill-ws-avatar-ink" /><circle cx="38" cy="28" r="1.4" className="fill-ws-avatar-ink" />
    <path d="M28 36q4 3 8 0" fill="none" className="stroke-ws-avatar-ink" strokeWidth="1.5" strokeLinecap="round" />
    {style === 'glasses' && <g fill="none" className="stroke-ws-avatar-ink" strokeWidth="1.6"><rect x="21" y="24" width="11" height="8" rx="3" /><rect x="34" y="24" width="11" height="8" rx="3" /><path d="M32 27h2" /></g>}
  </svg>;
}
export function WorkspaceAvatar({ person = {}, size = 'sm' }: { person?: WorkspacePersonData; size?: 'xs' | 'sm' | 'lg' }) {
  const { user } = useAuth(); const prefs = useSyncExternalStore(subscribe, snapshot, () => empty);
  const own = person.id === user?.id;
  const data = { ...person, avatar_url: person.avatar_url || (own ? user?.user_metadata?.avatar_url : null) };
  const source = avatarSource(data, person.id ? prefs[person.id] : undefined);
  const [failed, setFailed] = useState<string | null>(null);
  const fallback = avatarSource({ ...data, avatar_url: null }, { style: person.id ? prefs[person.id]?.style : undefined });
  const resolved = source.kind === 'photo' && failed === source.value ? fallback : source;
  const dimensions = { xs: 'h-7 w-7 text-[10px]', sm: 'h-9 w-9 text-xs', lg: 'h-16 w-16 text-xl' };
  return <span data-workspace-avatar={resolved.kind} className={`ws-avatar ${dimensions[size]}`} aria-hidden="true">
    {resolved.kind === 'photo' ? <img src={resolved.value} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" onError={() => setFailed(resolved.value)} /> : resolved.kind === 'illustration' ? <AvatarPortrait style={resolved.value} /> : resolved.value ? <span>{resolved.value}</span> : <UserRound className="h-1/2 w-1/2" />}
  </span>;
}
export function WorkspacePerson({ person, name, role, size = 'sm' }: { person?: WorkspacePersonData; name?: string | null; role?: string; size?: 'xs' | 'sm' | 'lg' }) {
  const display = name || person?.name || person?.email || 'Ei nimetty';
  return <span className="inline-flex max-w-full items-center gap-2 align-middle text-left"><WorkspaceAvatar person={{ ...person, name: person?.name || name }} size={size} /><span className="min-w-0"><span className="block break-words font-semibold leading-snug">{display}</span>{role && <span className="block text-xs font-normal text-muted-foreground">{role}</span>}</span></span>;
}
export function WorkspaceIdentity() {
  const { user, isAdmin, isEditor } = useAuth(); const prefs = useSyncExternalStore(subscribe, snapshot, () => empty); const [error, setError] = useState('');
  if (!user) return null;
  const person = { id: user.id, email: user.email, name: user.user_metadata?.full_name || user.user_metadata?.name };
  const set = (v: AvatarPreference) => { try { save(user.id, v); setError(''); } catch { setError('Kuvaa ei voitu tallentaa tähän selaimeen.'); } };
  const upload = async (file?: File) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setError('Valitse JPG-, PNG- tai WebP-kuva, enintään 5 Mt.'); return; }
    try {
      const bitmap = await createImageBitmap(file); const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 160;
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('canvas'); const side = Math.min(bitmap.width, bitmap.height);
      ctx.drawImage(bitmap, (bitmap.width-side)/2, (bitmap.height-side)/2, side, side, 0, 0, 160, 160); bitmap.close(); set({ ...prefs[user.id], photo: canvas.toDataURL('image/jpeg', 0.85) });
    } catch { setError('Kuvaa ei voitu avata. Valitse toinen kuva.'); }
  };
  return <Popover><PopoverTrigger asChild><Button variant="ghost" className="ws-identity h-auto justify-start gap-2 px-2 py-1.5" aria-label="Oma profiilikuva"><WorkspacePerson person={person} role={isAdmin ? 'Pääkäyttäjä' : isEditor ? 'Henkilöstö' : 'Kouluttaja'} /></Button></PopoverTrigger>
    <PopoverContent className="w-80 max-w-[calc(100vw-2rem)] space-y-4" align="end"><h2 className="font-bold">Oma profiilikuva</h2><p className="text-xs text-muted-foreground">Kuva ja avatarvalinta tallentuvat vain tähän selaimeen.</p>
      <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm font-semibold"><Camera className="h-4 w-4" />Valitse profiilikuva<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={e => upload(e.target.files?.[0])} /></label>
      <div className="grid grid-cols-4 gap-2">{AVATAR_STYLES.map((style, i) => <Button key={style} variant="outline" className="relative h-16 w-full p-1" aria-label={`Avatar ${i+1}`} aria-pressed={prefs[user.id]?.style === style && !prefs[user.id]?.photo} onClick={() => set({ style })}><span className="ws-avatar h-12 w-12"><AvatarPortrait style={style} /></span>{prefs[user.id]?.style === style && !prefs[user.id]?.photo && <Check className="absolute right-0 top-0 h-4 w-4 text-primary" />}</Button>)}</div>
      <Button variant="ghost" size="sm" onClick={() => set({})}><RotateCcw className="mr-2 h-4 w-4" />Käytä nimikirjaimia</Button>{error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </PopoverContent></Popover>;
}