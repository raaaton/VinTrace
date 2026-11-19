const {createClient}=require('@supabase/supabase-js');
const {createServerClient}=require('@supabase/ssr');
const assert=require('node:assert/strict');
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const admin=createClient(url,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
let uid,vid,path;const origin=process.env.SHOWROOM_TEST_ORIGIN || 'http://127.0.0.1:8766';
const checked=async q=>{const r=await q;if(r.error)throw Error(r.error.message);return r.data;};
(async()=>{
 const password=crypto.randomUUID()+'aA1!';const email='showroom-test-'+crypto.randomUUID()+'@example.com';
 const created=await checked(admin.auth.admin.createUser({email,password,email_confirm:true}));uid=created.user.id;
 const cookieMap=new Map();const owner=createServerClient(url,key,{cookies:{getAll:()=>[...cookieMap].map(([name,value])=>({name,value})),setAll:values=>values.forEach(c=>cookieMap.set(c.name,c.value))}});
 await checked(owner.auth.signInWithPassword({email,password}));
 vid=crypto.randomUUID();const slug='showroom-test-'+vid;path=`${uid}/${vid}/cover-image/test.png`;
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jCKQAAAAASUVORK5CYII=','base64');
 await checked(admin.storage.from('vehicle-media').upload(path,png,{contentType:'image/png'}));
 const signed=await checked(admin.storage.from('vehicle-media').createSignedUrl(path,3600));
 const vehicle=await checked(owner.from('vehicles').insert({id:vid,owner_id:uid,make:'TEST',model:'Showroom test',year:2000,kileage:120000,license_plate:'TEST',vin:'TESTVIN0011123456',slug,cover_image_url:signed.signedUrl}).select().single());
 const cookie=[...cookieMap].map(([n,v])=>`${n}=${v}`).join('; ');
 let res=await fetch(origin+`/garage/${slug}/showroom`,{headers:{cookie}});assert.equal(res.status,200);console.log('PASS aperçu propriétaire privé');
 const token=vehicle.public_token;res=await fetch(origin+'/s/'+token);assert.equal(res.status,404);console.log('PASS showroom non publié inaccessible');
 const entry=await checked(owner.from('entries').insert({vehicle_id:vid,owner_id:uid,title:'Entretien test',event_date:'2026-11-19',type:'service',kileage:120000,cost:654.32,description:'NOTE_PRIVEE_TEST',documents:[signed.signedUrl]}).select().single());
 await checked(owner.rpc('save_showroom_settings',{p_vehicle_id:vid,p_settings:{description:'Présentation test',showCosts:false,maskVin:true,preference:'ask',gallery:[],entries:[{id:entry.id,visible:true,showNotes:false,photos:[]}]}}));
 await checked(owner.from('vehicles').update({is_public:true}).eq('id',vid));
 res=await fetch(origin+'/s/'+token);assert.equal(res.status,200);const html=await res.text();assert.ok(html.includes('Entretien test'));for(const secret of ['NOTE_PRIVEE_TEST','654.32','123456',signed.signedUrl])assert.ok(!html.includes(secret),secret);console.log('PASS page publique et suppression des données privées');
 res=await fetch(origin+`/api/showroom/${token}/media?kind=cover`);assert.equal(res.status,200);assert.ok(res.headers.get('cache-control').includes('no-store'));console.log('PASS image autorisée sans cache');
 res=await fetch(origin+`/api/showroom/${token}/media?kind=entry&entry=${entry.id}&index=0`);assert.equal(res.status,404);console.log('PASS pièce jointe privée inaccessible');
 await checked(owner.from('vehicles').update({is_public:false}).eq('id',vid));
 for(const suffix of ['/s/'+token,`/api/showroom/${token}/media?kind=cover`]){res=await fetch(origin+suffix);assert.equal(res.status,404);}console.log('PASS dépublication révoque page et média');
 await checked(owner.from('vehicles').update({is_public:true}).eq('id',vid));res=await fetch(origin+'/s/'+token);assert.equal(res.status,200);console.log('PASS republication avec le même lien');
})().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(async()=>{
 if(vid){await checked(admin.from('entries').delete().eq('vehicle_id',vid));await checked(admin.from('vehicles').delete().eq('id',vid));}
 if(path)await checked(admin.storage.from('vehicle-media').remove([path]));
 if(uid)await checked(admin.auth.admin.deleteUser(uid));console.log('Données temporaires supprimées.');process.exit(process.exitCode||0);
});
