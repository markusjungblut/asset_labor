#!/usr/bin/env node
/* Self-contained local Windows launcher: private Python server + Chromium audit. */
import {spawn,spawnSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
// Every audit gets its own directory. Never delete the user's prior
// result.json/README/screenshots or any modified tracked artifacts.
const stamp=new Date().toISOString().replace(/[^0-9]/g,'');
const cli=process.argv.slice(2);
const outIndex=cli.indexOf('--out');
if(outIndex>=0&&(!cli[outIndex+1]||cli[outIndex+1].startsWith('--')))
 throw Error('--out requires a new, unused directory');
const output=resolve(root,outIndex>=0?cli[outIndex+1]:
 'artifacts/rendering-step16b-warm-'+stamp);
if(outIndex>=0)cli.splice(outIndex,2);
let server=null;
async function startServer(){
 const candidates=process.platform==='win32'?
  [{exe:'python',args:['server.py']},{exe:'py',args:['-3','server.py']}]:
  [{exe:'python3',args:['server.py']},{exe:'python',args:['server.py']}];
 let why='Python not found';
 for(const candidate of candidates){
  try{
   const started=await new Promise((yes,no)=>{
    let done=false,buffer='';
    const child=spawn(candidate.exe,candidate.args,{cwd:root,
     env:{...process.env,VEDRAS_PORT:'0',VEDRAS_NO_BROWSER:'1',
      VEDRAS_SILENT_HTTP:'1',PYTHONUNBUFFERED:'1'},
     stdio:['ignore','pipe','pipe']});
    server=child;
    const timer=setTimeout(()=>fail('Server start timed out'),25000);
    function finish(action,value){if(done)return;done=true;clearTimeout(timer);action(value);}
    function fail(message){child.kill();finish(no,Error(message));}
    child.on('error',error=>fail(error.message));
    child.on('exit',code=>fail('Server exited '+code));
    child.stderr.on('data',d=>process.stderr.write(String(d)));
    child.stdout.on('data',d=>{
     buffer=(buffer+String(d)).slice(-12000);
     const found=buffer.match(/Aktuelle URL:\s*(http:\/\/127\.0\.0\.1:\d+\/\?v=[^\s]+)/);
     if(found)finish(yes,{candidate,url:found[1],child});
    });
   });
   return started;
  }catch(e){why=e.message;server=null;}
 }
 throw Error('Unable to start local server: '+why);
}
async function main(){
 if(Number(process.versions.node.split('.')[0])<22)throw Error('Node 22+ required');
 if(process.argv.includes('--url'))throw Error('Launcher chooses isolated local server; omit --url');
 if(existsSync(output))throw Error('Audit directory already exists: '+output+
  '. Select a fresh --out to preserve prior evidence.');
 await mkdir(output,{recursive:true});
 const {candidate,url}=await startServer();
 console.log('Step16A: isolated local server '+url);
 const args=[resolve(root,'scripts/rendering-step16a-audit.mjs'),
  '--url',url,'--out',output,...cli];
 const child=spawn(process.execPath,args,{cwd:root,stdio:'inherit'});
 const code=await new Promise((yes,no)=>{
  child.once('error',no);child.once('close',status=>yes(status??1));
 });
 if(server){server.kill();server=null;}
 const packed=spawnSync(candidate.exe,
  [...candidate.args.slice(0,-1),'scripts/rendering-step16a-pack.py',output],
  {cwd:root,stdio:'inherit',timeout:30000});
 if(packed.status!==0)console.error('ZIP packaging failed; JSON/README remain at '+output);
 console.log('Step16B warm audit files and ZIP: '+output);
 if(code!==0)throw Error('Audit failed (see output/result.json for partial evidence)');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{
 if(server){server.kill();server=null;}
});
