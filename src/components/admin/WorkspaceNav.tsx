import { Button } from '@/components/ui/button';
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Users, Megaphone, Factory, FileText, BookOpen, Building2 } from "lucide-react";

const GROUPS = [
  { title: "Päivittäinen työ", items: [
    { to: "/admin", label: "Tilannekeskus", icon: LayoutDashboard, area: "ws-area-dashboard" },
    { to: "/admin/markkinointi?tab=leads", label: "Myynti", icon: Users, area: "ws-area-sales" },
    { to: "/admin/asiakkaat", label: "Asiakkaat", icon: Building2, area: "ws-area-sales" },
    { to: "/admin/tuotanto", label: "Tuotanto", icon: Factory, area: "ws-area-production" },
  ] },
  { title: "Markkinointi ja ylläpito", items: [
    { to: "/admin/markkinointi", label: "Markkinointi", icon: Megaphone, area: "ws-area-marketing" },
    { to: "/admin/kurssiluettelo", label: "Kurssiluettelo", icon: BookOpen, area: "ws-area-content" },
    { to: "/admin/sisallot", label: "Sisällöt", icon: FileText, area: "ws-area-content" },
  ] },
];

/** Pysyvä työtilavalikko: sama paikka joka sivulla, nykyinen sivu korostettu osion värillä. */
export function WorkspaceNav() {
  const { pathname, search } = useLocation();
  const salesTab = pathname === "/admin/yhteydenotot" || (pathname === "/admin/markkinointi" && /[?&]tab=(leads|daily|tasks|offers|sales|goals)(&|$)/.test(search));
  const { isEditor, roleLoading } = useAuth();
  const groups = isEditor || roleLoading ? GROUPS : [{ title: "Päivittäinen työ", items: GROUPS[0].items.filter(i => i.to === "/admin/tuotanto") }];
  return <nav aria-label="Työtilan valikko" className="ws-nav">
    <Link to="/admin" className="ws-nav-brand">KeudaPRO<span>Työtila</span></Link>
    {groups.map(g => <div key={g.title} className="ws-nav-group">
      <p className="ws-nav-title">{g.title}</p>
      {g.items.map(({ to, label, icon: Icon, area }) => {
        const path = to.split("?")[0];
        const active = to === "/admin" ? pathname === "/admin" : label === "Myynti" ? salesTab : path === "/admin/markkinointi" ? pathname === path && !salesTab : pathname.startsWith(path);
        return <Link key={to} to={to} aria-current={active ? "page" : undefined} className={`${area} ws-nav-link`}><Icon className="h-4 w-4 shrink-0" aria-hidden />{label}</Link>;
      })}
    </div>)}
    {isEditor && !salesTab && !pathname.startsWith('/admin/asiakkaat') && !pathname.startsWith('/admin/tuotanto') && <div className="ws-nav-group"><p className="ws-nav-title">Työjonot</p><Button asChild variant="ghost" size="sm" className="h-auto justify-start whitespace-normal"><Link to="/admin/markkinointi?tab=daily">Avaa myynnin työjono</Link></Button><Button asChild variant="ghost" size="sm" className="h-auto justify-start whitespace-normal"><Link to="/admin/tuotanto?osio=paiva">Avaa tuotannon päivän työ</Link></Button></div>}
  </nav>;
}
