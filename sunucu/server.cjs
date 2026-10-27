'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {generate}=require('./gemini.cjs');
const root=path.join(__dirname,'public');
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.pdf':'application/pdf','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
function configuration(env=process.env){
 const port=Number(env.PORT||4174),host=env.HOST||'127.0.0.1';
 if(!Number.isInteger(port)||port<0||port>65535)throw Error('PORT 0–65535 arasında olmalı.');
 const remote=env.NODE_ENV==='production'||!['127.0.0.1','localhost','::1'].includes(host);
 let origin='';if(env.PUBLIC_URL){const u=new URL(env.PUBLIC_URL);if(u.username||u.password||u.pathname!=='/'||u.search||u.hash)throw Error('PUBLIC_URL yalnızca sitenin kök adresi olmalı.');origin=u.origin;if(remote&&u.protocol!=='https:')throw Error('İnternet yayını için PUBLIC_URL HTTPS olmalı.');}
 if(remote&&(!origin||(env.APP_PASSWORD||'').length<16))throw Error('İnternet yayını için HTTPS PUBLIC_URL ve en az 16 karakterlik APP_PASSWORD gerekli.');
 return {port,host,remote,origin,user:env.APP_USER||'asuman',password:env.APP_PASSWORD||'',apiKey:env.GEMINI_API_KEY||'',model:env.GEMINI_MODEL||'gemini-3.8-flash'};
}
function createServer(config=configuration(),generateImpl=generate){
 let sessionKey='',busy=false;
 const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data))};
 const match=(a,b)=>{const x=crypto.createHash('sha256').update(a).digest(),y=crypto.createHash('sha256').update(b).digest();return crypto.timingSafeEqual(x,y)};
 async function body(req,limit){const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>limit)throw Object.assign(Error('Gönderilen veri çok uzun.'),{status:413});chunks.push(c)}try{return JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{throw Object.assign(Error('İstek verisi okunamadı.'),{status:400})}}
 return http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','same-origin');
  if(req.url==='/healthz'&&req.method==='GET'){json(res,200,{ok:true});return}
  const addressPort=req.socket.localPort;
  const allowed=config.remote?[new URL(config.origin).host]:[`127.0.0.1:${addressPort}`,`localhost:${addressPort}`,`[::1]:${addressPort}`];
  if(!allowed.includes(req.headers.host)){json(res,403,{error:'İzin verilmeyen adres.'});return}
  if(config.password){let credentials='';try{if(req.headers.authorization?.startsWith('Basic '))credentials=Buffer.from(req.headers.authorization.slice(6),'base64').toString('utf8')}catch{}if(!match(credentials,config.user+':'+config.password)){res.setHeader('WWW-Authenticate','Basic realm="Asuman Okul Takip", charset="UTF-8"');json(res,401,{error:'Öğretmen girişi gerekli.'});return}}
  const url=new URL(req.url,'http://'+req.headers.host);
  const sameOrigin=req.headers.origin===(config.remote?config.origin:'http://'+req.headers.host)&&String(req.headers['content-type']).split(';')[0]==='application/json';
  if(url.pathname==='/api/ai-status'&&req.method==='GET'){json(res,200,{configured:!!(sessionKey||config.apiKey),canConfigure:!config.remote});return}
  if(url.pathname==='/api/configure-gemini'){
   if(config.remote){json(res,403,{error:'İnternet sunucusunda anahtarı hosting ortam değişkenlerinden ayarlayın.'});return}
   if(req.method!=='POST'||!sameOrigin){json(res,403,{error:'İstek kaynağı doğrulanamadı.'});return}
   try{const data=await body(req,4096);if(typeof data.apiKey!=='string'||data.apiKey.trim().length<20||/[\r\n]/.test(data.apiKey))throw Object.assign(Error('Anahtar biçimini kontrol edin.'),{status:400});sessionKey=data.apiKey.trim();json(res,200,{configured:true})}catch(e){json(res,e.status||400,{error:e.message})}return;
  }
  if(url.pathname==='/api/generate-project'){
   if(req.method!=='POST'){json(res,405,{error:'POST gerekli.'});return}if(!sameOrigin){json(res,403,{error:'İstek kaynağı doğrulanamadı.'});return}
   if(busy){json(res,429,{error:'Bir proje hazırlanıyor. Tamamlanmasını bekleyin.'});return}
   busy=true;try{const data=await body(req,128000);json(res,200,await generateImpl(data.project,{apiKey:sessionKey||config.apiKey,model:config.model}))}catch(e){json(res,e.status||500,{error:e.status?e.message:'İşlem tamamlanamadı. Yeniden deneyin.'})}finally{busy=false}return;
  }
  if(url.pathname.startsWith('/api/')){json(res,404,{error:'Adres bulunamadı.'});return}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
  let pathname;try{pathname=decodeURIComponent(url.pathname)}catch{res.writeHead(400);res.end();return}
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)||pathname.split(/[\\/]/).some(p=>p.startsWith('.'))){res.writeHead(403);res.end();return}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Dosya bulunamadı.');return}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(req.method==='HEAD'?undefined:data)});
 });
}
if(require.main===module){
 try{const envFile=path.join(__dirname,'.env');if(fs.existsSync(envFile))process.loadEnvFile(envFile);const config=configuration();const server=createServer(config);server.on('error',e=>{console.error(e.code==='EADDRINUSE'?'Bu port kullanımda. .env içindeki PORT değerini değiştirin.':'Sunucu başlatılamadı: '+e.code);process.exitCode=1});server.listen(config.port,config.host,()=>console.log(config.remote?config.origin:`http://${config.host}:${server.address().port}/`));for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)))}catch(e){console.error(e.message);process.exitCode=1}
}
module.exports={createServer,configuration};
