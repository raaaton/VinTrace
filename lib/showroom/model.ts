import { maskVIN } from '../vin.ts';

export type Preference = 'ask' | 'public' | 'private';
export type ShowroomVehicle = {
 id:string; public_token:string; make:string; model:string; year:number; kileage:number; vin:string;
 showroom_description:string; showroom_gallery:string[]; showroom_show_costs:boolean; showroom_mask_vin:boolean;
};
export type ShowroomEntry = {
 id:string; title:string; type:string; event_date:string; kileage:number|null; cost:number|null;
 description:string|null; detailer:string|null; documents:string[]|null;
 showroom_visible:boolean|null; showroom_show_notes:boolean; showroom_photo_indices:number[];
};
export function isPhoto(url:string) { return /\.(jpe?g|png|webp)(?:\?|$)/i.test(url); }
export function publicPhotoIndices(entry:ShowroomEntry) {
 return [...new Set(entry.showroom_photo_indices)].filter(i=>Number.isInteger(i) && i>=0 && isPhoto(entry.documents?.[i] || ''));
}
export function mediaUrl(token:string, kind:string, index=0, entryId='') {
 return `/api/showroom/${encodeURIComponent(token)}/media?kind=${kind}&index=${index}${entryId ? `&entry=${encodeURIComponent(entryId)}` : ''}`;
}
export function projectShowroom(vehicle:ShowroomVehicle, entries:ShowroomEntry[]) {
 return {
  make:vehicle.make, model:vehicle.model, year:vehicle.year, mileage:vehicle.kileage,
  vin:vehicle.showroom_mask_vin ? maskVIN(vehicle.vin) : vehicle.vin,
  description:vehicle.showroom_description, cover:mediaUrl(vehicle.public_token,'cover'),
  gallery:vehicle.showroom_gallery.map((_,i)=>mediaUrl(vehicle.public_token,'gallery',i)),
  entries:entries.filter(e=>e.showroom_visible !== false).sort((a,b)=>b.event_date.localeCompare(a.event_date)).map(e=>{
   const photos=publicPhotoIndices(e);
   return { id:e.id, title:e.title, type:e.type, date:e.event_date, mileage:e.kileage,
    cost:vehicle.showroom_show_costs ? e.cost : null, notes:e.showroom_show_notes ? e.description : null,
    detailer:e.detailer, documentCount:(e.documents?.length||0)-photos.length,
    photos:photos.map(i=>mediaUrl(vehicle.public_token,'entry',i,e.id)) };
  }),
 };
}
export type PublicShowroom = ReturnType<typeof projectShowroom>;
export function resolveVisibility(published:boolean, preference:Preference, choice:boolean|undefined) {
 if (!published) return true;
 if (preference==='public') return true;
 if (preference==='private') return false;
 if (choice===undefined) throw new Error('Choisissez la visibilité de cet événement.');
 return choice;
}
