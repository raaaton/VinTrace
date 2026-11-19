import { test } from 'node:test';
import assert from 'node:assert/strict';
import { projectShowroom, resolveVisibility } from '../lib/showroom/model.ts';
const vehicle = { id:'v', public_token:'token', make:'Porsche', model:'911', year:1991, kileage:120000, vin:'WP0ZZZ99ZTS123456', cover_image_url:'secret-cover', showroom_description:'Une histoire', showroom_gallery:['secret-gallery'], showroom_show_costs:false, showroom_mask_vin:true, owner_id:'secret-owner', license_plate:'secret-plate' };
const entry = { id:'e', title:'Freins', type:'service', event_date:'2026-11-19', kileage:100, cost:456.78, description:'secret-note', detailer:'Garage', documents:['secret-invoice.pdf','secret-invoice.jpg','secret-photo.jpg'], showroom_visible:true, showroom_show_notes:false, showroom_photo_indices:[2] };
test('public projection removes secrets rather than hiding them in CSS', () => {
 const result = projectShowroom(vehicle, [entry, {...entry,id:'hidden',title:'secret-hidden',showroom_visible:false}]);
 const wire = JSON.stringify(result);
 for(const secret of ['123456','secret-','456.78','owner_id','license_plate','documents']) assert.ok(!wire.includes(secret), secret);
 assert.equal(result.vin,'WP0ZZZ99ZTS******');
 assert.equal(result.entries.length,1);
 assert.equal(result.entries[0].documentCount,2);
 assert.equal(result.entries[0].photos.length,1);
});
test('enabled costs, notes and full VIN remain available, zero cost included',()=>{
 const result=projectShowroom({...vehicle,showroom_mask_vin:false,showroom_show_costs:true},[{...entry,cost:0,showroom_show_notes:true}]);
 assert.equal(result.vin,vehicle.vin); assert.equal(result.entries[0].cost,0); assert.equal(result.entries[0].notes,'secret-note');
});
test('PDFs can never become public photos even when selected',()=>{
 const result=projectShowroom(vehicle,[{...entry,showroom_photo_indices:[0,0,1,99,-1]}]);
 assert.equal(result.entries[0].photos.length,1); assert.equal(result.entries[0].documentCount,2);
});
test('new events require a decision only when published and preference is ask',()=>{
 assert.equal(resolveVisibility(false,'ask',undefined),true);
 assert.throws(()=>resolveVisibility(true,'ask',undefined));
 assert.equal(resolveVisibility(true,'ask',false),false);
 assert.equal(resolveVisibility(true,'public',undefined),true);
 assert.equal(resolveVisibility(true,'private',undefined),false);
});
