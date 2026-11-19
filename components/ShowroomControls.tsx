'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowUp, ArrowDown, Copy, ExternalLink, Share2, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { setPublished, saveShowroom, type ShowroomSettings } from '@/app/actions/showroom-actions';
import { createClient } from '@/lib/supabase/client';
import { getDocumentLinks } from '@/lib/supabase/storage';
import { isPhoto } from '@/lib/showroom/model';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useMediaQuery } from '@/hooks/use-media-query';
import DocumentUploader from '@/components/DocumentUploader';
import ShowroomPanel from '@/components/ShowroomPanel';
import type { Tables } from '@/lib/supabase/database.types';

export default function ShowroomControls({vehicle,entries}:{vehicle:Tables<'vehicles'>;entries:Tables<'entries'>[]}) {
 const router=useRouter();
 const isDesktop=useMediaQuery("(min-width: 768px)");
 const [sharing,setSharing]=useState(false);
 const [published,setIsPublished]=useState(vehicle.is_public);
 const [pending,setPending]=useState(false);
 const [editing,setEditing]=useState(false);
 const [settings,setSettings]=useState<ShowroomSettings>(()=>({description:vehicle.showroom_description,showCosts:vehicle.showroom_show_costs,maskVin:vehicle.showroom_mask_vin,preference:vehicle.showroom_entry_preference as ShowroomSettings['preference'],gallery:vehicle.showroom_gallery,entries:entries.map(e=>({id:e.id,visible:e.showroom_visible!==false,showNotes:e.showroom_show_notes,photos:e.showroom_photo_indices}))}));
 const [uploads,setUploads]=useState<File[]>([]);
 const [link,setLink]=useState('');
 async function publish(value:boolean){
  setPending(true);
  try {await setPublished(vehicle.slug,value);setIsPublished(value);router.refresh();toast.success(value?'Showroom publié':'Showroom dépublié');}catch(error){toast.error(error instanceof Error?error.message:'Impossible de modifier le partage. Réessayez.');}finally{setPending(false);}
 }
 function updateEntry(id:string,patch:Partial<ShowroomSettings['entries'][number]>){setSettings(s=>({...s,entries:s.entries.map(e=>e.id===id?{...e,...patch}:e)}));}
 async function save(){
  setPending(true);
  try {
   let gallery=settings.gallery;
   if(uploads.length){
    const db=createClient(); const {data:{user}}=await db.auth.getUser();
    if(!user) throw new Error('Reconnectez-vous.');
    const urls=await getDocumentLinks(user,uploads,vehicle.id,'showroom-gallery');
    gallery=[...gallery,...urls];
    setSettings(s=>({...s,gallery}));setUploads([]);
   }
   await saveShowroom(vehicle.slug,{...settings,gallery});
   setSettings(s=>({...s,gallery}));setUploads([]);setEditing(false);router.refresh();toast.success('Showroom mis à jour');
  }catch(error){toast.error(error instanceof Error?error.message:'Impossible de sauvegarder.');}finally{setPending(false);}
 }
 function move(index:number,delta:number){setSettings(s=>{const gallery=[...s.gallery];[gallery[index],gallery[index+delta]]=[gallery[index+delta],gallery[index]];return {...s,gallery};});}
 const shareDescription=published
    ? 'Toute personne disposant du lien peut consulter ce dossier.'
    : 'Rendez l’historique de ce véhicule accessible publiquement via un lien unique.';
 function changeSharing(open: boolean) {
    if(open) setLink(`${window.location.origin}/s/${vehicle.public_token}`);
    setSharing(open);
 }
 const shareBody=(
    <div className="space-y-5">
        {published ? <>
            <span className="inline-flex items-center gap-2 bg-green-500/10 px-3 py-1 text-xs text-green-500"><span className="size-1.5 rounded-full bg-current" />Actif</span>
            <div className="flex min-w-0 items-center gap-2 border border-border bg-secondary/30 p-2">
                <Input aria-label="Lien public du showroom" value={link} readOnly className="min-w-0 border-0 bg-transparent text-xs" />
                <Button variant="outline" size="icon" className="shrink-0" aria-label="Copier le lien" onClick={async()=>{
                    try { await navigator.clipboard.writeText(link); toast.success('Lien copié'); }
                    catch { toast.error('Copie impossible. Sélectionnez le lien pour le copier.'); }
                }}><Copy size={16} /></Button>
            </div>
            <Button asChild className="w-full"><a href={`/s/${vehicle.public_token}`} target="_blank" rel="noreferrer"><ExternalLink size={16} />Voir la page publique</a></Button>
            <Button variant="ghost" disabled={pending} className="w-full text-red-400" onClick={()=>publish(false)}>Dépublier la page</Button>
        </> : <>
            <p className="text-sm leading-relaxed text-muted-foreground">Vérifiez le contenu dans « Personnaliser » avant de publier.</p>
            <Button disabled={pending} className="w-full" onClick={()=>publish(true)}>{pending?'Publication…':'Publier la page'}</Button>
        </>}
    </div>
 );
 const settingsBody=(
    <fieldset disabled={pending} className="min-w-0 space-y-8">
        <section className="space-y-3">
            <Label htmlFor="showroom-description">Le mot du propriétaire</Label>
            <Textarea id="showroom-description" maxLength={5000} rows={5} value={settings.description}
                placeholder="L’histoire de votre voiture, son état, votre projet…" className="resize-none"
                onChange={e=>setSettings({...settings,description:e.target.value})} />
        </section>
        <section className="space-y-3">
            <h3 className="text-sm font-medium">Informations publiques</h3>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><Checkbox checked={settings.showCosts} onCheckedChange={checked=>setSettings({...settings,showCosts:checked===true})} />Afficher les montants des interventions</label>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><Checkbox checked={settings.maskVin} onCheckedChange={checked=>setSettings({...settings,maskVin:checked===true})} />Masquer les 6 derniers caractères du VIN</label>
        </section>
        <section className="space-y-3">
            <Label id="showroom-preference-label">Nouveaux événements sur un showroom publié</Label>
            <RadioGroup aria-labelledby="showroom-preference-label" value={settings.preference} onValueChange={value=>setSettings({...settings,preference:value as ShowroomSettings['preference']})}>
                {([['ask','Toujours demander'],['public','Afficher automatiquement'],['private','Garder privés automatiquement']] as const).map(([value,label])=>(
                    <label key={value} className="flex min-h-11 cursor-pointer items-center gap-3 border border-border px-3 py-3 text-sm has-[[data-state=checked]]:border-primary/60 has-[[data-state=checked]]:bg-primary/5">
                        <RadioGroupItem value={value} className="data-[state=checked]:border-primary data-[state=checked]:bg-primary" />{label}
                    </label>
                ))}
            </RadioGroup>
        </section>
        <section className="space-y-4">
            <h3 className="text-sm font-medium">Galerie facultative</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">Jusqu’à 20 photos, 10 Mo chacune. Vérifiez les informations visibles avant de les partager.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {settings.gallery.map((url,i)=><div key={url} className="min-w-0 overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo de galerie ${i+1}`} className="aspect-[4/3] w-full object-cover" />
                    <div className="flex justify-between p-1">
                        <Button variant="ghost" size="icon" aria-label={`Monter la photo ${i+1}`} disabled={i===0||pending} onClick={()=>move(i,-1)}><ArrowUp size={14} /></Button>
                        <Button variant="ghost" size="icon" aria-label={`Descendre la photo ${i+1}`} disabled={i===settings.gallery.length-1||pending} onClick={()=>move(i,1)}><ArrowDown size={14} /></Button>
                        <Button variant="ghost" size="icon" aria-label={`Retirer la photo ${i+1}`} disabled={pending} onClick={()=>setSettings({...settings,gallery:settings.gallery.filter((_,index)=>index!==i)})}><Trash2 size={14} /></Button>
                    </div>
                </div>)}
            </div>
            {settings.gallery.length<20 && <DocumentUploader disabled={pending} isDesktop={isDesktop} files={uploads} fileLimit={20-settings.gallery.length} maxSize={10*1024*1024} accepts=".jpeg, .jpg, .png, .webp" setFilesAction={setUploads} />}
        </section>
        <section className="space-y-4">
            <h3 className="text-sm font-medium">Événements partagés</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">Les documents restent privés. Sélectionnez uniquement les images que vous souhaitez afficher comme photos.</p>
            {entries.map(entry=>{
                const setting=settings.entries.find(e=>e.id===entry.id)!;
                return <fieldset key={entry.id} className="min-w-0 space-y-3 border border-border p-4">
                    <legend className="max-w-full break-words px-1 text-sm">{entry.title}</legend>
                    <p className="text-xs text-muted-foreground">{new Date(`${entry.event_date}T12:00:00`).toLocaleDateString('fr-FR')}</p>
                    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><Checkbox checked={setting.visible} onCheckedChange={checked=>updateEntry(entry.id,{visible:checked===true})} />Afficher cet événement</label>
                    {setting.visible && <>
                        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><Checkbox checked={setting.showNotes} onCheckedChange={checked=>updateEntry(entry.id,{showNotes:checked===true})} />Afficher les notes</label>
                        {entry.documents?.map((url,index)=>isPhoto(url) && <label key={index} className="flex cursor-pointer items-center gap-3 border-t border-border pt-3 text-xs">
                            <Checkbox checked={setting.photos.includes(index)} onCheckedChange={checked=>updateEntry(entry.id,{photos:checked===true?[...setting.photos,index]:setting.photos.filter(i=>i!==index)})} />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`Pièce jointe ${index+1}`} className="h-14 w-14 shrink-0 object-cover" />
                            <span>Publier l’image {index+1} comme photo</span>
                        </label>)}
                    </>}
                </fieldset>;
            })}
            {!entries.length && <p className="text-sm text-muted-foreground">Aucun événement pour le moment.</p>}
        </section>
    </fieldset>
 );
 const secondaryButton='flex items-center gap-2 p-2 md:px-3 md:py-2 lg:px-4 lg:py-3 backdrop-blur-md bg-secondary/35 hover:bg-secondary/50 uppercase text-xs font-semibold border border-foreground/25 transition-colors ease-out';
 const shareButton=<button className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-3 text-primary-foreground bg-foreground hover:bg-stone-300 uppercase text-xs font-semibold transition-colors ease-out"><Share2 size={16} />Partager</button>;
 return <>
    <nav aria-label="Gestion du showroom" className="absolute inset-x-0 top-0 z-[60] flex items-center justify-between gap-3 p-6 lg:p-12">
        <Link href={`/garage/${vehicle.slug}`} className={secondaryButton} aria-label="Retour au véhicule"><ArrowLeft size={16} /><span className="hidden md:inline">Retour</span></Link>
        <div className="flex items-center gap-3">
            <button className={secondaryButton} onClick={()=>setEditing(true)} aria-label="Personnaliser le showroom" title="Personnaliser"><Settings size={16} /></button>
            {isDesktop ? <Popover open={sharing} onOpenChange={changeSharing}>
                <PopoverTrigger asChild>{shareButton}</PopoverTrigger>
                <PopoverContent align="end" sideOffset={12} className="w-[min(380px,calc(100vw-32px))] space-y-5 p-6 shadow-2xl">
                    <h2 className="text-lg font-semibold">{published?'Showroom public':'Partager le showroom'}</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">{shareDescription}</p>
                    {shareBody}
                </PopoverContent>
            </Popover> : <button onClick={()=>changeSharing(true)} className="flex items-center gap-2 bg-foreground px-3 py-2 text-xs font-semibold uppercase text-primary-foreground"><Share2 size={16} />Partager</button>}
        </div>
    </nav>
    {!isDesktop && <ShowroomPanel open={sharing} onOpenChange={changeSharing} title={published?'Showroom public':'Partager le showroom'} description={shareDescription}>{shareBody}</ShowroomPanel>}
    <ShowroomPanel open={editing} onOpenChange={open=>{if(!pending)setEditing(open);}} title="Personnaliser le showroom" description="Choisissez ce que les visiteurs peuvent voir. Les changements enregistrés s’appliquent immédiatement."
        footer={<Button className="w-full" disabled={pending} onClick={save}>{pending?'Enregistrement…':'Enregistrer les modifications'}</Button>}>
        {settingsBody}
    </ShowroomPanel>
 </>;
}
