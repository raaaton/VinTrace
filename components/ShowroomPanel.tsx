'use client';

import type { ReactNode } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from '@/components/ui/drawer';
import { X } from 'lucide-react';

export default function ShowroomPanel({ open, onOpenChange, title, description, children, footer, className = '' }: {
    open: boolean; onOpenChange: (open: boolean) => void; title: string;
    description: string; children: ReactNode; footer?: ReactNode; className?: string;
}) {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    if (isDesktop) return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl ${className}`}>
                <DialogHeader className="shrink-0 border-b border-border p-6 pr-12">
                    <DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 clean-scrollbar">{children}</div>
                {footer && <div className="shrink-0 border-t border-border bg-background p-6">{footer}</div>}
            </DialogContent>
        </Dialog>
    );
    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className={`!max-h-[92dvh] ${className}`}>
                <DrawerHeader className="relative shrink-0 border-b border-border pr-14 text-left">
                    <DrawerTitle>{title}</DrawerTitle><DrawerDescription>{description}</DrawerDescription>
                    <DrawerClose aria-label="Fermer" className="absolute right-4 top-4 p-2 text-muted-foreground"><X size={18} /></DrawerClose>
                </DrawerHeader>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 clean-scrollbar">{children}</div>
                {footer && <div className="shrink-0 border-t border-border bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
            </DrawerContent>
        </Drawer>
    );
}
