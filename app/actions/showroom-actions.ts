'use server';
import { ownerVehicle } from '@/lib/showroom/server';
import { isPhoto } from '@/lib/showroom/model';
import { revalidatePath } from 'next/cache';
import type { Preference } from '@/lib/showroom/model';

export async function setPublished(slug:string,published:boolean) {
 const {db,vehicle}=await ownerVehicle(slug);
 if(published && !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('La clé serveur Supabase doit être configurée avant de publier.');
 const {error}=await db.from('vehicles').update({is_public:published}).eq('id',vehicle.id).eq('owner_id',vehicle.owner_id);
 if(error) throw new Error('Impossible de modifier le partage.');
 revalidatePath(`/garage/${slug}/showroom`); revalidatePath(`/s/${vehicle.public_token}`);
}
export type ShowroomSettings={description:string; showCosts:boolean; maskVin:boolean; preference:Preference; gallery:string[]; entries:{id:string;visible:boolean;showNotes:boolean;photos:number[]}[]};
export async function saveShowroom(slug:string,settings:ShowroomSettings) {
 const {db,vehicle,entries}=await ownerVehicle(slug);
 if(settings.description.length>5000 || !['ask','public','private'].includes(settings.preference) || settings.gallery.length>20) throw new Error('Réglages invalides.');
 const prefix=`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/sign/vehicle-media/${vehicle.owner_id}/${vehicle.id}/showroom-gallery/`;
 if(settings.gallery.some(url=>!url.startsWith(prefix) || !isPhoto(url))) throw new Error('Image de galerie invalide.');
 // Validate every event before making any changes.
 for(const setting of settings.entries){
  const entry=entries.find(e=>e.id===setting.id);
  if(!entry || setting.photos.some(i=>!Number.isInteger(i)|| i<0 || !isPhoto(entry.documents?.[i]||''))) throw new Error('Événement ou photo invalide.');
 }
 const {error}=await db.rpc('save_showroom_settings',{p_vehicle_id:vehicle.id,p_settings:settings});
 if(error) throw new Error('Impossible de sauvegarder les réglages. Aucun changement appliqué.');
 revalidatePath(`/garage/${slug}/showroom`); revalidatePath(`/s/${vehicle.public_token}`);
}
