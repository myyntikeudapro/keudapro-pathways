import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Users, Megaphone, Factory, FileText, BookOpen } from "lucide-react";

const GROUPS = [
  { title: "Päivittäinen työ", items: [
    { to: "/admin", label: "Tilannekeskus", icon: LayoutDashboard, area: "ws-area-dashboard" },
    { to: "/admin/yhteydenotot", label: "Myynti", icon: Users, area: "ws-area-sales" },
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
  const { pathname } = useLocation();
  const { isEditor, roleLoading } = useAuth();
  const groups = isEditor || roleLoading ? GROUPS : [{ title: "Päivittäinen työ", items: GROUPS[0].items.filter(i => i.to === "/admin/tuotanto") }];
  return <nav aria-label="Työtilan valikko" className="ws-nav">
    <Link to="/admin" className="ws-nav-brand">KeudaPRO<span>Työtila</span></Link>
    {groups.map(g => <div key={g.title} className="ws-nav-group">
      <p className="ws-nav-title">{g.title}</p>
      {g.items.map(({ to, label, icon: Icon, area }) => {
        const active = to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);
        return <Link key={to} to={to} aria-current={active ? "page" : undefined} className={`${area} ws-nav-link`}><Icon className="h-4 w-4 shrink-0" aria-hidden />{label}</Link>;
      })}
    </div>)}
  </nav>;
}
