import {test} from 'node:test';
import assert from 'node:assert/strict';
import {acceptsUpload} from '../lib/upload-accept.ts';
test('camera photos with uppercase extensions remain accepted',()=>{
 assert.equal(acceptsUpload({name:'IMG_1234.JPG',type:'image/jpeg'},['.jpg','.png']),true);
 assert.equal(acceptsUpload({name:'IMG_1234.JPEG',type:'image/jpeg'},['.jpeg']),true);
});
test('MIME, wildcard and extension rules still reject unrelated files',()=>{
 assert.equal(acceptsUpload({name:'photo',type:'image/jpeg'},['image/jpeg']),true);
 assert.equal(acceptsUpload({name:'photo.webp',type:'image/webp'},['image/*']),true);
 assert.equal(acceptsUpload({name:'invoice.pdf',type:'application/pdf'},['.jpg','.png']),false);
});
