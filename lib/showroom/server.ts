import 'server-only';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export async function ownerVehicle(slug:string) {
 const db=await createClient();
 const {data:{user}}=await db.auth.getUser();
 if(!user) notFound();
 const {data:vehicle,error}=await db.from('vehicles').select('*').eq('slug',slug).eq('owner_id',user.id).single();
 if(error || !vehicle) notFound();
 const {data:entries,error:entriesError}=await db.from('entries').select('*').eq('vehicle_id',vehicle.id).order('event_date',{ascending:false});
 if(entriesError) throw new Error('Impossible de charger les événements.');
 return {db,vehicle,entries:entries||[]};
}
export async function accessibleShowroom(token:string) {
 if(!/^[0-9a-f-]{36}$/i.test(token)) notFound();
 // Owner preview also works while unpublished, without elevated credentials.
 const session=await createClient();
 const {data:{user}}=await session.auth.getUser();
 if(user){
  const {data}=await session.from('vehicles').select('*').eq('public_token',token).eq('owner_id',user.id).single();
  if(data) return {db:session,vehicle:data};
 }
 if(!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Configuration serveur Showroom manquante.');
 const db=createServiceRoleClient();
 const {data:vehicle,error}=await db.from('vehicles').select('*').eq('public_token',token).eq('is_public',true).single();
 if(error || !vehicle) notFound();
 return {db,vehicle};
}
