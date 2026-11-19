import ShowroomView from '@/components/ShowroomView';
import { accessibleShowroom } from '@/lib/showroom/server';
import { projectShowroom } from '@/lib/showroom/model';
import { notFound } from 'next/navigation';
export const dynamic='force-dynamic';
export const metadata={title:'Showroom | VinTrace',robots:{index:false,follow:false}};
export default async function PublicShowroom({params}:{params:Promise<{token:string}>}) {
 const {token}=await params;
 const {db,vehicle}=await accessibleShowroom(token);
 // Even owners use the private preview route for an unpublished showroom.
 if(!vehicle.is_public) notFound();
 const {data:entries,error}=await db.from('entries').select('*').eq('vehicle_id',vehicle.id);
 if(error) throw new Error('Impossible de charger le showroom.');
 return <ShowroomView data={projectShowroom(vehicle,entries||[])}/>;
}
