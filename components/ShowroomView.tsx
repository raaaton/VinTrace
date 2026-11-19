import type { PublicShowroom } from '@/lib/showroom/model';
import { ArrowDown, FileText, LockKeyhole } from 'lucide-react';

const types: Record<string, string> = {
    service: 'Entretien', modification: 'Modification', admin: 'Administratif', event: 'Événement',
};
const number = (value: number) => value.toLocaleString('fr-FR');
const date = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR');

export default function ShowroomView({ data }: { data: PublicShowroom }) {
    const documentCount = data.entries.reduce((total, entry) => total + entry.documentCount, 0);
    return (
        <article className="showroom-page w-full bg-white text-stone-950">
            <header className="grid lg:min-h-[100svh] lg:grid-cols-2">
                <div className="relative min-h-[55svh] bg-stone-200 lg:min-h-[100svh]">
                    {/* Access-controlled media must bypass the Next image cache. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={data.cover} alt={`${data.make} ${data.model}`} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/20" />
                    <div className="absolute bottom-0 left-0 hidden max-w-[80%] bg-white/90 px-8 py-7 backdrop-blur-sm lg:block">
                        <p className="mb-2 text-[10px] uppercase tracking-[.2em] text-stone-500">Dossier automobile</p>
                        <p className="text-lg">{data.make} {data.model}</p>
                    </div>
                </div>
                <div className="flex min-w-0 flex-col justify-center px-6 py-12 sm:px-12 lg:px-14 lg:pb-20 lg:pt-36 xl:px-20">
                    <div className="mb-10 h-1 w-12 bg-stone-950 lg:mb-16" />
                    <p className="mb-5 text-xs uppercase tracking-[.24em] text-stone-500">{data.make}</p>
                    <p className="text-6xl font-light leading-none tracking-tighter sm:text-7xl xl:text-8xl">{data.year}</p>
                    <h1 className="mt-2 break-words text-5xl font-semibold leading-[.95] tracking-tighter sm:text-6xl xl:text-7xl 2xl:text-8xl">{data.model}</h1>
                    <dl className="mt-10 grid gap-7 border-t border-stone-200 pt-8 sm:grid-cols-2 lg:mt-14">
                        <div><dt className="mb-3 text-[10px] uppercase tracking-[.16em] text-stone-500">Kilométrage</dt><dd className="text-2xl font-light tracking-tight sm:text-3xl">{number(data.mileage)} <span className="text-lg">km</span></dd></div>
                        <div className="min-w-0"><dt className="mb-3 text-[10px] uppercase tracking-[.16em] text-stone-500">Numéro de série · VIN</dt><dd className="select-all break-all font-mono text-sm leading-8">{data.vin}</dd></div>
                    </dl>
                    <a href="#showroom-history" className="mt-10 flex w-fit items-center gap-3 py-3 text-[10px] uppercase tracking-[.18em] text-stone-500 hover:text-stone-950 lg:mt-16"><ArrowDown size={14} />Découvrir son histoire</a>
                </div>
            </header>

            <section id="showroom-history" className="scroll-mt-8 border-t border-stone-100 lg:grid lg:grid-cols-[1.45fr_1fr]">
                <div className="min-w-0 px-6 py-12 sm:px-12 lg:px-16 lg:py-20 xl:px-24">
                    <h2 className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[.14em]"><span className="size-2 shrink-0 rounded-full bg-primary" />Histoire & suivi du véhicule</h2>
                    {data.description && <p className="mt-8 whitespace-pre-wrap break-words font-serif text-xl leading-relaxed text-stone-600">{data.description}</p>}
                    <div className="mb-8 mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-8">
                        <h3 className="text-[10px] font-semibold uppercase tracking-[.16em] text-stone-500">Historique partagé</h3>
                        <span className="text-xs text-stone-500">{data.entries.length} événement{data.entries.length !== 1 ? 's' : ''}</span>
                    </div>
                    {!data.entries.length && <p className="text-sm text-stone-500">Aucun événement partagé pour le moment.</p>}
                    <div className="space-y-8">
                        {data.entries.map(entry => <div key={entry.id} className="grid gap-2 sm:grid-cols-[90px_minmax(0,1fr)] sm:gap-5">
                            <time dateTime={entry.date} className="pt-1 font-mono text-xs text-stone-500">{date(entry.date)}</time>
                            <div className="min-w-0">
                                <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-wider text-stone-500"><span>{types[entry.type]}</span>{entry.mileage !== null && <span>{number(entry.mileage)} km</span>}</div>
                                <div className="flex flex-wrap justify-between gap-2"><h4 className="min-w-0 break-words text-base font-medium">{entry.title}</h4>{entry.cost !== null && <span className="shrink-0 text-sm tabular-nums">{number(entry.cost)} €</span>}</div>
                                {entry.detailer && <p className="mt-1 text-sm text-stone-500">{entry.detailer}</p>}
                                {entry.notes && <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-stone-600">{entry.notes}</p>}
                                {entry.documentCount > 0 && <p className="mt-3 flex items-center gap-2 text-xs text-stone-500"><FileText size={13} />{entry.documentCount} justificatif{entry.documentCount > 1 ? 's' : ''} · contenu privé</p>}
                                {entry.photos.length > 0 && <div className="mt-4 grid grid-cols-2 gap-2">{entry.photos.map((src, i) => <a key={src} href={src} target="_blank" rel="noreferrer" aria-label={`Ouvrir la photo ${i + 1} de ${entry.title}`}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={src} alt={`${entry.title} — photo ${i + 1}`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                                </a>)}</div>}
                            </div>
                        </div>)}
                    </div>
                </div>
                <aside className="flex flex-col justify-center gap-8 bg-stone-50 px-6 py-12 sm:px-12 lg:px-14 lg:py-20 xl:px-20">
                    <div><p className="text-[10px] uppercase tracking-[.2em] text-stone-500">Le dossier en un regard</p><h3 className="mt-4 text-3xl font-light tracking-tight">Une histoire documentée.</h3></div>
                    <dl className="grid grid-cols-2 gap-6 border-y border-stone-200 py-8"><div><dd className="text-4xl font-light tabular-nums">{data.entries.length.toString().padStart(2, '0')}</dd><dt className="mt-3 text-xs text-stone-500">Événements partagés</dt></div><div><dd className="text-4xl font-light tabular-nums">{documentCount.toString().padStart(2, '0')}</dd><dt className="mt-3 text-xs text-stone-500">Justificatifs joints</dt></div></dl>
                    <div className="flex items-start gap-4 border border-stone-200 bg-white p-6"><LockKeyhole size={22} className="mt-1 shrink-0" /><div><h4 className="text-sm font-medium">Documents conservés par le propriétaire</h4><p className="mt-2 text-sm leading-relaxed text-stone-500">Leur présence est indiquée dans ce dossier. Leur contenu reste privé.</p></div></div>
                    <p className="text-xs leading-relaxed text-stone-500">Informations renseignées par le propriétaire. VinTrace ne certifie ni le contenu des justificatifs ni l’exhaustivité de l’historique partagé.</p>
                </aside>
            </section>

            {data.gallery.length > 0 && <section className="px-6 py-12 sm:px-12 lg:px-16 lg:py-20 xl:px-24"><h2 className="mb-8 text-3xl font-light tracking-tight">Sous tous les angles</h2><div className="grid gap-4 sm:grid-cols-2">{data.gallery.map((src, i) => <a key={src} href={src} target="_blank" rel="noreferrer" aria-label={`Ouvrir la photo ${i + 1}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${data.make} ${data.model} — photo ${i + 1}`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </a>)}</div></section>}

            {documentCount > 0 && <section className="bg-[#111111] px-6 py-12 text-white sm:px-12 lg:px-16 lg:py-20 xl:px-24"><div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-6"><h2 className="text-2xl font-light tracking-tight sm:text-3xl">Archives numériques & documentation</h2><p className="text-[10px] uppercase tracking-[.16em] text-stone-400">{documentCount} justificatif{documentCount > 1 ? 's' : ''} · contenu privé</p></div><div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-8">{data.entries.flatMap(entry => Array.from({ length: entry.documentCount }, (_, i) => <div key={`${entry.id}-${i}`}>
                <div className="flex aspect-[3/4] flex-col items-center justify-center gap-4 bg-stone-200 px-4 text-center text-stone-500"><FileText size={32} strokeWidth={1} /><span className="text-[10px] font-medium uppercase tracking-[.14em] sm:text-xs">Justificatif {i + 1}</span><span className="flex items-center gap-1.5 text-[10px]"><LockKeyhole size={11} />Contenu privé</span></div>
                <p className="mt-4 break-words text-sm">{entry.title}</p><p className="mt-1 font-mono text-xs text-stone-400">{date(entry.date)}</p>
            </div>))}</div></section>}
            <footer className="flex items-center justify-between border-t border-stone-200 bg-white px-6 py-6 text-[10px] uppercase tracking-widest text-stone-500 sm:px-12"><span>VinTrace · Dossier automobile</span><span>{new Date().getFullYear()}</span></footer>
        </article>
    );
}
