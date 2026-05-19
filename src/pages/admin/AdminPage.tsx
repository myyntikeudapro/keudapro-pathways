import { useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, LogOut, EyeOff, Eye, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { SEO } from "@/components/seo/SEO";

type Category = { id: string; page_slug: string; category_slug: string; label: string; sort_order: number };
type Card = {
  id: string;
  category_id: string;
  title: string;
  ingress: string;
  read_more_url: string | null;
  cta_type: "enroll" | "ask";
  cta_url: string | null;
  image_url: string | null;
  published: boolean;
  sort_order: number;
};

type CardDraft = Omit<Card, "id" | "sort_order"> & { id?: string };

const PAGE_LABELS: Record<string, string> = {
  osaaminen: "Osaaminen (Pätevyydet)",
  aly: "Äly",
  kasvu: "Kasvu",
  noste: "Noste",
};

export default function AdminPage() {
  const { user, loading, isEditor, roleLoading, signOut } = useAuth();
  const qc = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<CardDraft | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ["card_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_categories")
        .select("*")
        .order("page_slug")
        .order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user && isEditor,
  });

  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ["training_cards", selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      const { data, error } = await supabase
        .from("training_cards")
        .select("*")
        .eq("category_id", selectedCategoryId)
        .order("sort_order");
      if (error) throw error;
      return data as Card[];
    },
    enabled: !!selectedCategoryId,
  });

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const groupedCategories = useMemo(() => {
    const groups: Record<string, Category[]> = {};
    categories.forEach((c) => {
      groups[c.page_slug] = groups[c.page_slug] ?? [];
      groups[c.page_slug].push(c);
    });
    return groups;
  }, [categories]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isEditor) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Ei käyttöoikeutta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tililläsi ({user.email}) ei ole editori- tai admin-roolia. Pyydä pääkäyttäjää lisäämään rooli.
            </p>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> Kirjaudu ulos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const openNew = () => {
    if (!selectedCategoryId) {
      toast.error("Valitse ensin kategoria");
      return;
    }
    setEditing({
      category_id: selectedCategoryId,
      title: "",
      ingress: "",
      read_more_url: "",
      cta_type: "ask",
      cta_url: "",
      image_url: null,
      published: true,
    });
    setEditorOpen(true);
  };

  const openEdit = (c: Card) => {
    setEditing({ ...c });
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title.trim()) { toast.error("Nimi vaaditaan"); return; }
    if (editing.ingress.length > 100) { toast.error("Ingressi max 100 merkkiä"); return; }
    const payload = {
      category_id: editing.category_id,
      title: editing.title.trim(),
      ingress: editing.ingress,
      read_more_url: editing.read_more_url?.trim() || null,
      cta_type: editing.cta_type,
      cta_url: editing.cta_url?.trim() || null,
      image_url: editing.image_url,
      published: editing.published,
    };
    try {
      if (editing.id) {
        const { error } = await supabase.from("training_cards").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Kortti päivitetty");
      } else {
        const maxSort = cards.reduce((m, c) => Math.max(m, c.sort_order), -1);
        const { error } = await supabase.from("training_cards").insert({ ...payload, sort_order: maxSort + 1 });
        if (error) throw error;
        toast.success("Kortti lisätty");
      }
      setEditorOpen(false);
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["training_cards"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tallennus epäonnistui");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from("training_cards").delete().eq("id", deleteId);
      if (error) throw error;
      toast.success("Kortti poistettu");
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ["training_cards"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Poisto epäonnistui");
    }
  };

  const togglePublished = async (c: Card) => {
    const { error } = await supabase.from("training_cards").update({ published: !c.published }).eq("id", c.id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["training_cards"] });
  };

  const moveCard = async (c: Card, dir: -1 | 1) => {
    const sorted = [...cards].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((x) => x.id === c.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    const { error: e1 } = await supabase.from("training_cards").update({ sort_order: other.sort_order }).eq("id", c.id);
    const { error: e2 } = await supabase.from("training_cards").update({ sort_order: c.sort_order }).eq("id", other.id);
    if (e1 || e2) { toast.error("Järjestyksen vaihto epäonnistui"); return; }
    qc.invalidateQueries({ queryKey: ["training_cards"] });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <SEO title="Sisältöeditori – KeudaPRO" description="Korttien hallintapaneeli." path="/admin" />
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Sisältöeditori</h1>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/">Sivustolle</Link></Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> Kirjaudu ulos
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Kategoriat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {catsLoading && <p className="text-sm text-muted-foreground">Ladataan...</p>}
              {!catsLoading && categories.length === 0 && (
                <p className="text-sm text-muted-foreground">Ei kategorioita. Luo ensimmäinen alta.</p>
              )}
              {Object.entries(groupedCategories).map(([page, items]) => (
                <div key={page} className="space-y-1">
                  <p className="text-xs font-medium uppercase text-muted-foreground tracking-wide">
                    {PAGE_LABELS[page] ?? page}
                  </p>
                  {items.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`block w-full text-left px-2 py-1.5 rounded text-sm transition ${
                        selectedCategoryId === cat.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full" onClick={() => setNewCategoryOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Uusi kategoria
              </Button>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {categories.find((c) => c.id === selectedCategoryId)?.label ?? "Valitse kategoria"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {cards.length} korttia · {cards.filter((c) => c.published).length} julkaistua
              </p>
            </div>
            <Button onClick={openNew} disabled={!selectedCategoryId}>
              <Plus className="mr-2 h-4 w-4" /> Uusi kortti
            </Button>
          </div>

          {cardsLoading && <p className="text-sm text-muted-foreground">Ladataan kortteja...</p>}
          {!cardsLoading && selectedCategoryId && cards.length === 0 && (
            <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Ei vielä kortteja. Klikkaa "Uusi kortti".</CardContent></Card>
          )}

          <div className="grid gap-3">
            {cards.map((c, idx) => (
              <Card key={c.id} className={c.published ? "" : "opacity-60"}>
                <CardContent className="py-4 flex items-start gap-3">
                  <div className="flex flex-col gap-1">
                    <Button size="icon" variant="ghost" disabled={idx === 0} onClick={() => moveCard(c, -1)}><ArrowUp className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" disabled={idx === cards.length - 1} onClick={() => moveCard(c, 1)}><ArrowDown className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{c.title}</h3>
                      {!c.published && <Badge variant="secondary">Piilotettu</Badge>}
                      <Badge variant="outline">{c.cta_type === "enroll" ? "Ilmoittaudu" : "Kysy lisää"}</Badge>
                    </div>
                    {c.ingress && <p className="text-sm text-muted-foreground mt-1">{c.ingress}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => togglePublished(c)} title={c.published ? "Piilota" : "Julkaise"}>
                      {c.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteId(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Editor dialog */}
      <Dialog open={editorOpen} onOpenChange={(o) => { setEditorOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Muokkaa korttia" : "Uusi kortti"}</DialogTitle>
            <DialogDescription>Täytä kortin tiedot. Tähdellä merkityt ovat pakollisia.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Nimi *</Label>
                <Input id="title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ingress">Ingressi <span className="text-muted-foreground">({editing.ingress.length}/100)</span></Label>
                <Textarea id="ingress" maxLength={100} rows={2} value={editing.ingress} onChange={(e) => setEditing({ ...editing, ingress: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="readmore">"Lue lisää" -linkki</Label>
                <Input id="readmore" type="url" placeholder="https://..." value={editing.read_more_url ?? ""} onChange={(e) => setEditing({ ...editing, read_more_url: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Toimintapainike</Label>
                <RadioGroup value={editing.cta_type} onValueChange={(v) => setEditing({ ...editing, cta_type: v as "enroll" | "ask" })} className="flex gap-4">
                  <div className="flex items-center gap-2"><RadioGroupItem value="enroll" id="cta-enroll" /><Label htmlFor="cta-enroll" className="font-normal">Ilmoittaudu</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="ask" id="cta-ask" /><Label htmlFor="cta-ask" className="font-normal">Kysy lisää</Label></div>
                </RadioGroup>
                <Input type="url" placeholder="https://..." value={editing.cta_url ?? ""} onChange={(e) => setEditing({ ...editing, cta_url: e.target.value })} />
              </div>
              <div className="flex items-center justify-between rounded border p-3">
                <div>
                  <p className="text-sm font-medium">Julkaistu</p>
                  <p className="text-xs text-muted-foreground">Näytetäänkö kortti sivustolla</p>
                </div>
                <Switch checked={editing.published} onCheckedChange={(v) => setEditing({ ...editing, published: v })} />
              </div>

              {/* Preview */}
              <div className="rounded border bg-background p-4">
                <p className="text-xs font-medium uppercase text-muted-foreground mb-2">Esikatselu</p>
                <h4 className="font-semibold text-foreground">{editing.title || "Kortin nimi"}</h4>
                {editing.ingress && <p className="text-sm text-muted-foreground mt-1">{editing.ingress}</p>}
                <div className="mt-3 flex gap-2 text-xs">
                  {editing.read_more_url && <span className="underline text-primary">Lue lisää →</span>}
                  <span className="px-2 py-1 rounded bg-primary text-primary-foreground">
                    {editing.cta_type === "enroll" ? "Ilmoittaudu" : "Kysy lisää"}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>Peruuta</Button>
            <Button onClick={handleSave}>Tallenna</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Poistetaanko kortti?</AlertDialogTitle>
            <AlertDialogDescription>Tätä toimintoa ei voi peruuttaa.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Peruuta</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Poista</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New category */}
      <NewCategoryDialog open={newCategoryOpen} onOpenChange={setNewCategoryOpen} onCreated={(id) => {
        qc.invalidateQueries({ queryKey: ["card_categories"] });
        setSelectedCategoryId(id);
      }} />
    </div>
  );
}

function NewCategoryDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: (id: string) => void }) {
  const [page, setPage] = useState("osaaminen");
  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");

  const submit = async () => {
    if (!label.trim() || !slug.trim()) { toast.error("Anna nimi ja tunniste"); return; }
    const { data, error } = await supabase.from("card_categories").insert({
      page_slug: page,
      category_slug: slug.trim().toLowerCase(),
      label: label.trim(),
      sort_order: 0,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    toast.success("Kategoria luotu");
    setLabel(""); setSlug("");
    onOpenChange(false);
    onCreated(data.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Uusi kategoria</DialogTitle>
          <DialogDescription>Kategoria ryhmittää kortit sivun sisällä.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Sivu</Label>
            <Select value={page} onValueChange={setPage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PAGE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Näytettävä nimi</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="esim. Logistiikka" />
          </div>
          <div className="space-y-1.5">
            <Label>Tunniste (URL-ystävällinen)</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="esim. logistiikka" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Peruuta</Button>
          <Button onClick={submit}>Luo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
