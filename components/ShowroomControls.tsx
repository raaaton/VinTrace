'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowUp, ArrowDown, Copy, ExternalLink, Share2, SlidersHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { setPublished, saveShowroom, type ShowroomSettings } from '@/app/actions/showroom-actions';
import { createClient } from '@/lib/supabase/client';
import { getDocumentLinks } from '@/lib/supabase/storage';
import { isPhoto } from '@/lib/showroom/model';
import type { Tables } from '@/lib/supabase/database.types';

export default function ShowroomControls({vehicle,entries}:{vehicle:Tables<'vehicles'>;entries:Tables<'entries'>[]}) {
 const router=useRouter();
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
 return <>
  <nav aria-label="Gestion du showroom" className="absolute left-0 right-0 z-[60] flex flex-wrap items-center justify-between gap-3 p-4 md:p-8">
   <Button asChild variant="secondary"><Link href={`/garage/${vehicle.slug}`}><ArrowLeft size={16}/><span className="hidden sm:inline">Garage</span></Link></Button>
   <div className="flex gap-2">
    <Button variant="secondary" onClick={()=>setEditing(true)}><SlidersHorizontal size={16}/><span className="hidden sm:inline">Personnaliser</span></Button>
    <Popover onOpenChange={open=>{if(open)setLink(`${window.location.origin}/s/${vehicle.public_token}`);}}>
     <PopoverTrigger asChild><Button><Share2 size={16}/>Partager</Button></PopoverTrigger>
     <PopoverContent align="end" sideOffset={12} className="w-[min(380px,calc(100vw-32px))] space-y-4 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">{published?'Showroom public':'Partager le showroom'}</h2>{published&&<span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-500">● Actif</span>}</div>
      <p className="text-sm leading-relaxed text-muted-foreground">{published?'Toute personne disposant du lien peut consulter ce dossier.':'Rendez l’historique de ce véhicule accessible publiquement via un lien unique.'}</p>
      {published ? <>
       <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 p-2"><Input aria-label="Lien public du showroom" value={link} readOnly className="min-w-0 border-0 bg-transparent text-xs"/><Button variant="outline" size="icon" aria-label="Copier le lien" onClick={async()=>{try{await navigator.clipboard.writeText(link);toast.success('Lien copié');}catch{toast.error('Copie impossible. Sélectionnez le lien pour le copier.');}}}><Copy size={16}/></Button></div>
       <Button asChild className="w-full"><a href={`/s/${vehicle.public_token}`} target="_blank" rel="noreferrer"><ExternalLink size={16}/>Voir la page publique</a></Button>
       <Button variant="ghost" disabled={pending} className="w-full text-red-400" onClick={()=>publish(false)}>Dépublier la page</Button>
      </> : <><p className="text-xs text-muted-foreground">Vérifiez le contenu dans « Personnaliser » avant de publier.</p><Button disabled={pending} className="w-full" onClick={()=>publish(true)}>{pending?'Publication…':'Publier la page'}</Button></>}
     </PopoverContent>
    </Popover>
   </div>
  </nav>
  <Dialog open={editing} onOpenChange={open=>{if(!pending)setEditing(open);}}>
   <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
    <DialogHeader><DialogTitle>Personnaliser le showroom</DialogTitle><DialogDescription>Choisissez ce que les visiteurs peuvent voir. Les changements enregistrés s’appliquent immédiatement.</DialogDescription></DialogHeader>
    <fieldset disabled={pending} className="space-y-8 py-4">
     <section className="space-y-3"><label htmlFor="showroom-description" className="text-sm font-medium">Le mot du propriétaire</label><Textarea id="showroom-description" maxLength={5000} rows={5} value={settings.description} placeholder="L’histoire de votre voiture, son état, votre projet…" onChange={e=>setSettings({...settings,description:e.target.value})}/></section>
     <section className="space-y-4"><h3 className="font-medium">Informations publiques</h3><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={settings.showCosts} onChange={e=>setSettings({...settings,showCosts:e.target.checked})}/>Afficher les montants des interventions</label><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={settings.maskVin} onChange={e=>setSettings({...settings,maskVin:e.target.checked})}/>Masquer les 6 derniers caractères du VIN</label></section>
     <section className="space-y-3"><label htmlFor="showroom-preference" className="text-sm font-medium">Nouveaux événements sur un showroom publié</label><select id="showroom-preference" className="w-full rounded-md border border-border bg-background p-3 text-sm" value={settings.preference} onChange={e=>setSettings({...settings,preference:e.target.value as ShowroomSettings['preference']})}><option value="ask">Toujours demander</option><option value="public">Afficher automatiquement</option><option value="private">Garder privés automatiquement</option></select></section>
     <section className="space-y-4"><h3 className="font-medium">Galerie facultative</h3><p className="text-xs text-muted-foreground">Jusqu’à 20 photos. Vérifiez les plaques, visages et autres informations visibles avant de les partager.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{settings.gallery.map((url,i)=><div key={url} className="overflow-hidden rounded-md border border-border">
       {/* eslint-disable-next-line @next/next/no-img-element */}
       <img src={url} alt={`Photo de galerie ${i+1}`} className="aspect-[4/3] w-full object-cover"/><div className="flex justify-between p-1"><Button variant="ghost" size="icon" aria-label={`Monter la photo ${i+1}`} disabled={i===0||pending} onClick={()=>move(i,-1)}><ArrowUp size={14}/></Button><Button variant="ghost" size="icon" aria-label={`Descendre la photo ${i+1}`} disabled={i===settings.gallery.length-1||pending} onClick={()=>move(i,1)}><ArrowDown size={14}/></Button><Button variant="ghost" size="icon" aria-label={`Retirer la photo ${i+1}`} disabled={pending} onClick={()=>setSettings({...settings,gallery:settings.gallery.filter((_,index)=>index!==i)})}><Trash2 size={14}/></Button></div></div>)}</div>
      <Input aria-label="Ajouter des photos à la galerie" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={pending} onChange={e=>{const files=Array.from(e.target.files||[]);if(files.length+settings.gallery.length>20||files.some(f=>f.size>10*1024*1024 || !['image/jpeg','image/png','image/webp'].includes(f.type))){toast.error('Maximum 20 photos, JPEG/PNG/WebP, 10 Mo chacune.');e.target.value='';return;}setUploads(files);}}/>{uploads.length>0 && <p className="text-xs text-muted-foreground">{uploads.length} photo(s) à ajouter lors de l’enregistrement.</p>}
     </section>
     <section className="space-y-3"><h3 className="font-medium">Événements partagés</h3><p className="text-xs text-muted-foreground">Les documents restent privés. Sélectionnez uniquement les images que vous souhaitez afficher comme photos.</p>
      {entries.map(entry=>{const setting=settings.entries.find(e=>e.id===entry.id)!;return <fieldset key={entry.id} className="space-y-3 rounded-lg border border-border p-4"><legend className="max-w-full px-1 text-sm">{entry.title} · {entry.event_date}</legend><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={setting.visible} onChange={e=>updateEntry(entry.id,{visible:e.target.checked})}/>Afficher cet événement</label>{setting.visible&&<><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={setting.showNotes} onChange={e=>updateEntry(entry.id,{showNotes:e.target.checked})}/>Afficher les notes</label>{entry.documents?.map((url,index)=>isPhoto(url)&&<label key={index} className="flex items-center gap-3 text-xs"><input type="checkbox" checked={setting.photos.includes(index)} onChange={e=>updateEntry(entry.id,{photos:e.target.checked?[...setting.photos,index]:setting.photos.filter(i=>i!==index)})}/>
       {/* eslint-disable-next-line @next/next/no-img-element */}
       <img src={url} alt={`Pièce jointe ${index+1}`} className="h-14 w-14 rounded object-cover"/>Publier l’image {index+1} comme photo</label>)}</>}</fieldset>;})}
      {!entries.length&&<p className="text-sm text-muted-foreground">Aucun événement pour le moment.</p>}
     </section>
    </fieldset>
    <Button disabled={pending} onClick={save}>{pending?'Enregistrement…':'Enregistrer les modifications'}</Button>
   </DialogContent>
  </Dialog>
 </>;
}
