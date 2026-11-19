import assert from 'node:assert/strict';
const base=process.env.SHOWROOM_TEST_ORIGIN || 'http://127.0.0.1:8766';
for(const [path,status] of [
 ['/_next/image?url='+encodeURIComponent('/api/showroom/11111111-1111-1111-1111-111111111111/media?kind=cover')+'&w=640&q=75',400],
 ['/_next/image?url=%2Fimages%2Flogo.png&w=640&q=75',200],
 ['/s/invalid',404],
 ['/api/showroom/invalid/media?kind=cover',404],
 ['/garage/anything/showroom',307]
]) {
 const result=await fetch(base+path,{redirect:'manual'});
 assert.equal(result.status,status,path);
 console.log('PASS',status,path);
}
