const assert=require('node:assert/strict');const {generate}=require('../gemini.cjs');
const project={name:'Deneme enerji projesi',type:'TEKNOFEST',purpose:'Sınıftaki gereksiz enerji tüketimini azaltmak.',captain:'PRIVATE_PERSON',teamId:'PRIVATE_ID',members:[{name:'PRIVATE_STUDENT'}],findings:'Öğretmenin gerçek bulgusu',sources:'Öğretmenin kaynağı'};
(async()=>{
 await assert.rejects(generate(project,{apiKey:''}),{status:503});
 await assert.rejects(generate({...project,purpose:''},{apiKey:'test-only'}),{status:400});
 let request;const result=await generate(project,{apiKey:'test-only',fetchImpl:async(url,options)=>{request=options;return{ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({sections:{summary:'Öneri özeti',method:'Öneri yöntemi',captain:'HALLUCINATED',findings:'FAKE_RESULT'},reviewNotes:['Kaynakları doğrulayın.']})}]}}]})}}});
 assert(!request.body.includes('PRIVATE_'));assert(!('findings' in result.sections));assert(!('captain' in result.sections));assert.equal(result.sections.summary,'Öneri özeti');
 await assert.rejects(generate(project,{apiKey:'test-only',fetchImpl:async()=>({ok:false,status:429})}),{status:429});
 await assert.rejects(generate(project,{apiKey:'test-only',fetchImpl:async()=>({ok:true,json:async()=>({candidates:[{finishReason:'MAX_TOKENS'}]})})}),{status:502});
 const server=require('../server.cjs');await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;
 try{let res=await fetch(`http://127.0.0.1:${port}/api/ai-status`);assert.equal(res.status,403);res=await fetch(`http://127.0.0.1:${port}/api/generate-project`,{method:'POST',headers:{host:'127.0.0.1:4174','Content-Type':'application/json',origin:'https://foreign.example'},body:JSON.stringify({project})});assert.equal(res.status,403)}finally{await new Promise(r=>server.close(r))}
 console.log('PASS: missing key, validation, personal-data filtering, protected evidence, response parsing, quota, truncation, host/origin guards');
})().catch(e=>{console.error(e.message);process.exitCode=1});
