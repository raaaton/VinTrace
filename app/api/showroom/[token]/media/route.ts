import { accessibleShowroom } from '@/lib/showroom/server';
import { publicPhotoIndices } from '@/lib/showroom/model';
export const dynamic='force-dynamic';
export async function GET(request:Request,{params}:{params:Promise<{token:string}>}) {
 const {token}=await params;
 const {db,vehicle}=await accessibleShowroom(token);
 const query=new URL(request.url).searchParams;
 const index=Number(query.get('index')||0);
 if(!Number.isInteger(index)||index<0) return new Response(null,{status:404});
 let source:string|undefined;
 switch(query.get('kind')) {
  case 'cover': source=vehicle.cover_image_url; break;
  case 'gallery': source=vehicle.showroom_gallery[index]; break;
  case 'entry': {
   const {data:entry}=await db.from('entries').select('*').eq('id',query.get('entry')||'').eq('vehicle_id',vehicle.id).single();
   if(entry && entry.showroom_visible!==false && publicPhotoIndices(entry).includes(index)) source=entry.documents?.[index];
   break;
  }
 }
 if(!source) return new Response(null,{status:404});
 const url=new URL(source,process.env.NEXT_PUBLIC_SUPABASE_URL);
 const prefix=`/storage/v1/object/sign/vehicle-media/${vehicle.owner_id}/${vehicle.id}/`;
 if(url.origin!==new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin || !decodeURIComponent(url.pathname).startsWith(prefix)) return new Response(null,{status:404});
 const upstream=await fetch(url,{cache:'no-store',redirect:'error'});
 const contentType=upstream.headers.get('content-type')?.split(';')[0]||'';
 if(!upstream.ok || !['image/jpeg','image/png','image/webp'].includes(contentType)) return new Response(null,{status:404});
 return new Response(upstream.body,{headers:{'Content-Type':contentType,'Cache-Control':'private, no-store, max-age=0','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
}
