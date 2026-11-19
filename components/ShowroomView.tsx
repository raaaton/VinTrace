import type { PublicShowroom } from '@/lib/showroom/model';
import { FileText, LockKeyhole } from 'lucide-react';
const types:Record<string,string>={service:'Entretien',modification:'Modification',admin:'Administratif',event:'Événement'};
const number=(value:number)=>value.toLocaleString('fr-FR');
export default function ShowroomView({data}:{data:PublicShowroom}) {
 return <article className="w-full pb-20">
  <header className="relative flex min-h-[520px] items-end overflow-hidden bg-secondary md:min-h-[650px]">
   {/* Authenticated media proxy must not pass through the Next image cache. */}
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img src={data.cover} alt={`${data.make} ${data.model}`} className="absolute inset-0 h-full w-full object-cover" />
   <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/20" />
   <div className="relative mx-auto w-full max-w-6xl px-6 pb-12 pt-36">
    <p className="mb-4 text-xs uppercase tracking-[.3em] text-primary">{data.make} · {data.year}</p>
    <h1 className="break-words text-5xl font-light tracking-tighter md:text-8xl">{data.model}</h1>
    <div className="mt-8 flex flex-wrap gap-x-12 gap-y-5 font-mono text-sm">
     <div><p className="mb-1 text-xs text-muted-foreground">KILOMÉTRAGE</p>{number(data.mileage)} km</div>
     <div><p className="mb-1 text-xs text-muted-foreground">VIN</p><span className="select-all break-all">{data.vin}</span></div>
    </div>
   </div>
  </header>
  <div className="mx-auto max-w-6xl space-y-16 px-6 pt-12 md:space-y-24">
   {data.description && <section className="max-w-3xl"><p className="mb-4 text-xs uppercase tracking-widest text-primary">Le mot du propriétaire</p><p className="whitespace-pre-wrap break-words text-lg font-light leading-relaxed text-muted-foreground">{data.description}</p></section>}
   {data.gallery.length>0 && <section><h2 className="mb-6 text-2xl font-light">En images</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{data.gallery.map((src,i)=><a key={src} href={src} target="_blank" rel="noreferrer" aria-label={`Ouvrir la photo ${i+1}`}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt={`${data.make} ${data.model} — photo ${i+1}`} loading="lazy" className="aspect-[4/3] w-full object-cover" /></a>)}</div></section>}
   <section><div className="mb-10 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-6"><h2 className="text-3xl font-light">L’histoire du véhicule</h2><span className="text-sm text-muted-foreground">{data.entries.length} événement{data.entries.length!==1?'s':''}</span></div>
    {!data.entries.length && <p className="text-muted-foreground">Aucun événement partagé pour le moment.</p>}
    {data.entries.map(entry=><div key={entry.id} className="relative border-l border-border pb-12 pl-6 md:pl-10"><span className="absolute -left-1.5 top-1 size-3 rotate-45 bg-primary" />
     <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground"><time dateTime={entry.date}>{new Date(`${entry.date}T12:00:00`).toLocaleDateString('fr-FR')}</time>{entry.mileage!==null && <span>{number(entry.mileage)} km</span>}<span className="uppercase tracking-wider">{types[entry.type]}</span></div>
     <div className="flex flex-wrap justify-between gap-3"><h3 className="break-words text-xl">{entry.title}</h3>{entry.cost!==null && <span className="font-mono">{number(entry.cost)} €</span>}</div>
     {entry.detailer && <p className="mt-2 text-sm text-muted-foreground">{entry.detailer}</p>}
     {entry.notes && <p className="mt-4 whitespace-pre-wrap break-words border-l-2 border-primary/30 pl-4 text-sm leading-relaxed text-muted-foreground">{entry.notes}</p>}
     {entry.photos.length>0 && <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{entry.photos.map((src,i)=><a href={src} key={src} target="_blank" rel="noreferrer" aria-label={`Ouvrir la photo ${i+1} de ${entry.title}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`${entry.title} — photo ${i+1}`} loading="lazy" className="aspect-[4/3] w-full object-cover" /></a>)}</div>}
     {entry.documentCount>0 && <div className="mt-5 flex flex-wrap gap-3">{Array.from({length:entry.documentCount},(_,i)=><div key={i} className="flex items-center gap-3 border border-border bg-secondary/30 px-4 py-3"><FileText size={20} className="text-muted-foreground"/><div className="text-xs"><p>Justificatif {i+1}</p><p className="mt-1 flex items-center gap-1 text-muted-foreground"><LockKeyhole size={10}/>Contenu privé</p></div></div>)}</div>}
    </div>)}
    <p className="border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">Dossier renseigné par le propriétaire. La présence de justificatifs ne constitue pas une vérification de leur contenu par VinTrace.</p>
   </section>
  </div>
 </article>;
}
