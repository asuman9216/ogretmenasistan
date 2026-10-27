const {test}=require('node:test'),assert=require('node:assert/strict');
const {createServer,configuration}=require('../server.cjs');
const {generate}=require('../gemini.cjs');
function rawFetch(url,options={}){return new Promise((resolve,reject)=>{const req=require('node:http').request(url,{method:options.method||'GET',headers:options.headers},res=>{let text='';res.setEncoding('utf8');res.on('data',c=>text+=c);res.on('end',()=>resolve({status:res.statusCode,text:async()=>text,json:async()=>JSON.parse(text)}))});req.on('error',reject);req.end(options.body)})}
async function running(config,fn,provider){const server=createServer(config,provider);await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;try{await fn(base)}finally{server.closeAllConnections();await new Promise(r=>server.close(r))}}
test('configuration supports portable hosting and rejects unprotected public binding',()=>{assert.equal(configuration({}).port,4174);assert.throws(()=>configuration({HOST:'0.0.0.0'}));assert.throws(()=>configuration({PORT:'invalid'}));assert.throws(()=>configuration({NODE_ENV:'production',PUBLIC_URL:'http://school.example',APP_PASSWORD:'1234567890123456'}));assert.equal(configuration({NODE_ENV:'production',HOST:'0.0.0.0',PUBLIC_URL:'https://school.example',APP_PASSWORD:'1234567890123456'}).remote,true)});
test('all assets and references are served from a fresh server; secrets stay outside public',async()=>running(configuration({}),async base=>{
 for(const file of ['/','/workshop.js','/workshop.css','/gemini-settings.js','/vendor/docx.js','/references/teknofest-sunum.pdf','/references/teknofest-kilavuz.pdf','/references/tubitak-sablon.docx','/references/tubitak-rehber.pdf']){const r=await fetch(base+file);assert.equal(r.status,200,file);assert((await r.arrayBuffer()).byteLength>0,file)}
 for(const file of ['/.env','/server.cjs','/gemini.cjs','/%2e%2e%5cserver.cjs'])assert.notEqual((await fetch(base+file)).status,200,file);
 const s=await fetch(base+'/api/ai-status');assert.deepEqual(await s.json(),{configured:false,canConfigure:true});
 assert.equal((await fetch(base+'/healthz')).status,200);
 const settings=await fetch(base+'/api/configure-gemini',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({apiKey:'test-only-not-a-real-key-12345'})});assert.equal(settings.status,200);assert(!(await settings.text()).includes('test-only'));
 assert.equal((await(await fetch(base+'/api/ai-status')).json()).configured,true);
}));
test('origin checks, missing key and invalid data errors',async()=>running(configuration({}),async base=>{
 const post=(data,origin=base)=>fetch(base+'/api/generate-project',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data)});
 assert.equal((await post({},'https://foreign.example')).status,403);
 assert.equal((await post({project:{}})).status,503);
 assert.equal((await fetch(base+'/api/generate-project')).status,405);
 const malformed=await fetch(base+'/api/generate-project',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{'});assert.equal(malformed.status,400);
}));
test('password protects pages and API; generation passes configuration to provider',async()=>running(configuration({APP_PASSWORD:'test-password-123456'}),async base=>{
 assert.equal((await fetch(base+'/')).status,401);assert.equal((await fetch(base+'/api/ai-status')).status,401);
 const auth='Basic '+Buffer.from('asuman:test-password-123456').toString('base64');assert.equal((await fetch(base+'/',{headers:{Authorization:auth}})).status,200);
 const r=await fetch(base+'/api/generate-project',{method:'POST',headers:{Authorization:auth,Origin:base,'Content-Type':'application/json'},body:JSON.stringify({project:{name:'Deneme'}})});assert.equal(r.status,200);assert.equal((await r.json()).sections.summary,'Test önerisi');
},async(p,options)=>{assert.equal(p.name,'Deneme');assert.equal(options.model,'gemini-3.8-flash');return{sections:{summary:'Test önerisi',method:'Test yöntemi'},reviewNotes:[]}}));
test('Gemini filters identities and evidence, validates and reports provider failures',async()=>{
 const p={type:'TEKNOFEST',name:'Deneme projesi',purpose:'Gereksiz enerji kullanımını azaltmak.',captain:'PRIVATE_CAPTAIN',members:[{name:'PRIVATE_STUDENT'}],teamId:'PRIVATE_ID'};
 await assert.rejects(generate(p,{apiKey:''}),{status:503});await assert.rejects(generate({...p,name:9},{apiKey:'test'}),{status:400});
 const result=await generate(p,{apiKey:'test-only',fetchImpl:async(url,opt)=>{assert(!opt.body.includes('PRIVATE_'));assert.equal(opt.headers['x-goog-api-key'],'test-only');return{ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({sections:{summary:'Özet',method:'Yöntem',findings:'FAKE',captain:'FAKE'},reviewNotes:[]})}]}}]})}}});assert.deepEqual(result.sections,{summary:'Özet',method:'Yöntem'});
 await assert.rejects(generate(p,{apiKey:'test',fetchImpl:async()=>({ok:false,status:429})}),{status:429});
 await assert.rejects(generate(p,{apiKey:'test',fetchImpl:async()=>({ok:true,json:async()=>({candidates:[{finishReason:'MAX_TOKENS'}]})})}),{status:502});
});
test('production uses HTTPS origin, password and environment key; browser key editing disabled',async()=>{
 const config=configuration({HOST:'0.0.0.0',NODE_ENV:'production',PUBLIC_URL:'https://school.example',APP_PASSWORD:'test-password-123456',GEMINI_API_KEY:'test-server-secret'});
 await running(config,async base=>{const headers={Host:'school.example',Authorization:'Basic '+Buffer.from('asuman:test-password-123456').toString('base64')};
 const status=await rawFetch(base+'/api/ai-status',{headers});assert.equal(status.status,200);const text=await status.text();assert(!text.includes('test-server-secret'));assert.deepEqual(JSON.parse(text),{configured:true,canConfigure:false});
 const edit=await rawFetch(base+'/api/configure-gemini',{method:'POST',headers:{...headers,Origin:'https://school.example','Content-Type':'application/json'},body:'{}'});assert.equal(edit.status,403);
 const result=await rawFetch(base+'/api/generate-project',{method:'POST',headers:{...headers,Origin:'https://school.example','Content-Type':'application/json'},body:JSON.stringify({project:{name:'Test'}})});assert.equal(result.status,200);
 },async(p,opt)=>{assert.equal(opt.apiKey,'test-server-secret');return{sections:{summary:'Özet',method:'Yöntem'},reviewNotes:[]}});
});
