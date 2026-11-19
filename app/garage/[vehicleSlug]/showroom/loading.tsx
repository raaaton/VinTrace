import type { ComponentProps } from 'react';
import { ArrowDown, ArrowLeft, FileText, Settings, Share2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ScrollToTop from '@/components/ScrollToTop';

function Placeholder({ className, ...props }: ComponentProps<typeof Skeleton>) {
    return <Skeleton className={`bg-stone-200 motion-reduce:animate-none ${className ?? ''}`} {...props} />;
}

function EventSkeleton() {
    return (
        <div className="grid gap-2 sm:grid-cols-[90px_minmax(0,1fr)] sm:gap-5">
            <Placeholder className="mt-1 h-4 w-20" />
            <div className="min-w-0">
                <div className="mb-2 flex gap-3"><Placeholder className="h-3 w-16" /><Placeholder className="h-3 w-20" /></div>
                <div className="flex flex-wrap justify-between gap-2"><Placeholder className="h-6 w-3/4" /><Placeholder className="h-5 w-14" /></div>
                <Placeholder className="mt-1 h-5 w-40 max-w-full" />
                <div className="mt-3 flex items-center gap-2"><FileText size={13} className="text-stone-300" /><Placeholder className="h-4 w-36" /></div>
            </div>
        </div>
    );
}

export default function Loading() {
    const secondaryButton = 'flex items-center gap-2 p-2 md:px-3 md:py-2 lg:px-4 lg:py-3 backdrop-blur-md bg-secondary/35 uppercase text-xs font-semibold border border-foreground/25 text-foreground';
    const actionButton = 'flex items-center gap-2 bg-black px-3 py-2 text-xs font-semibold uppercase text-white lg:px-4 lg:py-3';
    return (
        <div className="showroom-page relative w-full bg-white text-stone-950" aria-busy="true">
            <ScrollToTop />
            <span role="status" className="sr-only">Chargement du showroom…</span>
            <div aria-hidden="true">
                {/* Keep the same toolbar footprint without offering unavailable actions. */}
                <div className="absolute inset-x-0 top-0 z-[60] flex items-center justify-between gap-3 p-6 lg:p-12">
                    <span className={secondaryButton}><ArrowLeft size={16} /><span className="hidden md:inline">Retour</span></span>
                    <div className="flex items-center gap-3">
                        <span className={actionButton}><Settings size={16} /></span>
                        <span className={actionButton}><Share2 size={16} />Partager</span>
                    </div>
                </div>

                <div className="grid lg:min-h-[100svh] lg:grid-cols-2">
                    <div className="relative min-h-[55svh] bg-stone-200 lg:min-h-[100svh]">
                        <Placeholder className="absolute inset-0 bg-stone-300" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10" />
                        <div className="absolute bottom-0 left-0 hidden max-w-[80%] bg-white/90 px-8 py-7 lg:block">
                            <p className="mb-2 text-[10px] uppercase tracking-[.2em] text-stone-500">Dossier automobile</p>
                            <Placeholder className="h-7 w-52 max-w-full" />
                        </div>
                    </div>
                    <div className="flex min-w-0 flex-col justify-center px-6 py-12 sm:px-12 lg:px-14 lg:pb-20 lg:pt-36 xl:px-20">
                        <div className="mb-10 h-1 w-12 bg-stone-950 lg:mb-16" />
                        <Placeholder className="mb-5 h-4 w-24" />
                        <Placeholder className="h-[1em] w-[2.1em] text-6xl leading-none sm:text-7xl xl:text-8xl" />
                        <div className="mt-2 space-y-[.08em] text-5xl leading-[.95] sm:text-6xl xl:text-7xl 2xl:text-8xl">
                            <Placeholder className="h-[.9em] w-full max-w-[6em]" />
                            <Placeholder className="h-[.9em] w-3/4 max-w-[4.5em]" />
                        </div>
                        <div className="mt-10 grid gap-7 border-t border-stone-200 pt-8 sm:grid-cols-2 lg:mt-14">
                            <div><p className="mb-3 text-[10px] uppercase tracking-[.16em] text-stone-500">Kilométrage</p><Placeholder className="h-8 w-36 max-w-full sm:h-9" /></div>
                            <div className="min-w-0"><p className="mb-3 text-[10px] uppercase tracking-[.16em] text-stone-500">Numéro de série · VIN</p><Placeholder className="my-2 h-4 w-40 max-w-full" /></div>
                        </div>
                        <div className="mt-10 flex w-fit items-center gap-3 py-3 text-[10px] uppercase tracking-[.18em] text-stone-400 lg:mt-16"><ArrowDown size={14} />Découvrir son histoire</div>
                    </div>
                </div>

                <div className="border-t border-stone-100 lg:grid lg:grid-cols-[1.45fr_1fr]">
                    <div className="min-w-0 px-6 py-12 sm:px-12 lg:px-16 lg:py-20 xl:px-24">
                        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[.14em]"><span className="size-2 shrink-0 bg-primary" />Histoire & suivi du véhicule</p>
                        <div className="mt-8 space-y-3"><Placeholder className="h-5 w-full" /><Placeholder className="h-5 w-full" /><Placeholder className="h-5 w-2/3" /></div>
                        <div className="mb-8 mt-10 flex items-center justify-between gap-3 border-t border-stone-200 pt-8">
                            <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-stone-500">Historique partagé</p><Placeholder className="h-4 w-20" />
                        </div>
                        <div className="space-y-8">{[0, 1, 2].map(index => <EventSkeleton key={index} />)}</div>
                    </div>
                    <div className="flex flex-col justify-center gap-8 bg-stone-50 px-6 py-12 sm:px-12 lg:px-14 lg:py-20 xl:px-20">
                        <div><p className="text-[10px] uppercase tracking-[.2em] text-stone-500">Le dossier en un regard</p><Placeholder className="mt-4 h-9 w-4/5" /></div>
                        <div className="grid grid-cols-2 gap-6 border-y border-stone-200 py-8">{[0, 1].map(index => <div key={index}><Placeholder className="h-10 w-14" /><Placeholder className="mt-3 h-4 w-28 max-w-full" /></div>)}</div>
                        <div className="flex gap-4 border border-stone-200 bg-white p-6"><Placeholder className="mt-1 size-6 shrink-0" /><div className="min-w-0 flex-1 space-y-3"><Placeholder className="h-5 w-full" /><Placeholder className="h-4 w-full" /><Placeholder className="h-4 w-3/4" /></div></div>
                        <div className="space-y-2"><Placeholder className="h-3 w-full" /><Placeholder className="h-3 w-full" /><Placeholder className="h-3 w-2/3" /></div>
                    </div>
                </div>

                <div className="bg-[#111111] px-6 py-12 text-white sm:px-12 lg:px-16 lg:py-20 xl:px-24">
                    <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-6"><p className="text-2xl font-light tracking-tight sm:text-3xl">Archives numériques & documentation</p><Placeholder className="h-3 w-40 bg-white/15" /></div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-8">{[0, 1, 2, 3].map(index => <div key={index}><Placeholder className="aspect-[3/4] w-full bg-white/15" /><Placeholder className="mt-4 h-5 w-4/5 bg-white/15" /><Placeholder className="mt-1 h-4 w-24 bg-white/10" /></div>)}</div>
                </div>
                <div className="flex items-center justify-between border-t border-stone-200 bg-white px-6 py-6 text-[10px] uppercase tracking-widest text-stone-500 sm:px-12"><span>VinTrace · Dossier automobile</span><span>{new Date().getFullYear()}</span></div>
            </div>
        </div>
    );
}
