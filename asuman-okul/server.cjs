const http=require('http'),fs=require('fs'),path=require('path');
const {generate}=require('./gemini.cjs');const root=path.join(__dirname,'dist'),port=4174;let busy=false,sessionKey='';
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.pdf':'application/pdf','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data))}
const server=http.createServer(async(req,res)=>{
 const host=req.headers.host;if(!['127.0.0.1:'+port,'localhost:'+port].includes(host)){json(res,403,{error:'İzin verilmeyen adres.'});return}
 const url=new URL(req.url,'http://'+host);
 if(url.pathname==='/api/ai-status'){json(res,200,{configured:!!(sessionKey||process.env.GEMINI_API_KEY)});return}
 if(url.pathname==='/api/configure-gemini'){
  if(req.method!=='POST'||req.headers.origin!=='http://'+host||!String(req.headers['content-type']).startsWith('application/json')){json(res,403,{error:'İstek kaynağı doğrulanamadı.'});return}
  try{let body='';for await(const chunk of req){body+=chunk;if(body.length>4096)throw Error()}const data=JSON.parse(body);if(typeof data.apiKey!=='string'||data.apiKey.trim().length<20||/[\r\n]/.test(data.apiKey))throw Error();sessionKey=data.apiKey.trim();json(res,200,{configured:true})}catch{json(res,400,{error:'Anahtar biçimini kontrol edin.'})}return;
 }
 if(url.pathname==='/api/generate-project'){
  if(req.method!=='POST'){json(res,405,{error:'POST gerekli.'});return}
  if(req.headers.origin!=='http://'+host||!String(req.headers['content-type']).startsWith('application/json')){json(res,403,{error:'İstek kaynağı doğrulanamadı.'});return}
  if(busy){json(res,429,{error:'Bir proje hazırlanıyor. Tamamlanmasını bekleyin.'});return}
  busy=true;try{let size=0,body='';for await(const chunk of req){size+=chunk.length;if(size>128000)throw Object.assign(new Error('Proje bilgileri çok uzun.'),{status:413});body+=chunk}let data;try{data=JSON.parse(body)}catch{throw Object.assign(new Error('Proje verisi okunamadı.'),{status:400})}json(res,200,await generate(data.project,{apiKey:sessionKey||process.env.GEMINI_API_KEY}))}catch(e){json(res,e.status||500,{error:e.status?e.message:'İşlem tamamlanamadı. Yeniden deneyin.'})}finally{busy=false}return;
 }
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
 let pathname;try{pathname=decodeURIComponent(url.pathname)}catch{res.writeHead(400);res.end();return}const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.end(req.method==='HEAD'?undefined:data)});
});
if(require.main===module)server.listen(port,'127.0.0.1',()=>console.log('http://127.0.0.1:'+port+' — Gemini '+(process.env.GEMINI_API_KEY?'hazır':'anahtarı bekleniyor')));
module.exports=server;
