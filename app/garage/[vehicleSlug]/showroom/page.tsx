import ShowroomView from '@/components/ShowroomView';
import ShowroomControls from '@/components/ShowroomControls';
import { ownerVehicle } from '@/lib/showroom/server';
import { projectShowroom } from '@/lib/showroom/model';
export const dynamic='force-dynamic';
export const metadata={title:'Aperçu du showroom | VinTrace',robots:{index:false,follow:false}};
export default async function Preview({params}:{params:Promise<{vehicleSlug:string}>}) {
 const {vehicleSlug}=await params;
 const {vehicle,entries}=await ownerVehicle(vehicleSlug);
 return <div className="relative w-full"><ShowroomControls key={JSON.stringify([vehicle,entries])} vehicle={vehicle} entries={entries}/><ShowroomView data={projectShowroom(vehicle,entries)}/></div>;
}
