#!/usr/bin/env node
/**
 * One-click Windows-friendly Step-13 acceptance.
 * Starts an isolated local server, runs the real Chromium benchmark and shuts
 * down only the server it started. Requires Node 22+ and Python 3.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';

const repo=resolve(dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(repo);
const scene=resolve(repo,'artifacts/rendering-step13/vedras_scene.json');
const output=resolve(repo,'artifacts/rendering-step13-auto');
let server=null;
let shuttingDown=false;
const stop=()=>{
  if(shuttingDown)return;
  shuttingDown=true;
  if(server&&!server.killed)server.kill();
};
process.on('SIGINT',()=>{stop();process.exitCode=130;});
process.on('SIGTERM',()=>{stop();process.exitCode=143;});

async function startServer(){
  const candidates=process.platform==='win32'
    ?[{exe:'python',args:['server.py']},{exe:'py',args:['-3','server.py']}]
    :[{exe:'python3',args:['server.py']},{exe:'python',args:['server.py']}];
  let lastError='';
  for(const candidate of candidates){
    try{
      return await new Promise((resolveReady,rejectReady)=>{
        let settled=false,buffer='';
        const env={...process.env,VEDRAS_PORT:'0',VEDRAS_NO_BROWSER:'1',PYTHONUNBUFFERED:'1'};
        const child=spawn(candidate.exe,candidate.args,{cwd:repo,env,stdio:['ignore','pipe','pipe']});
        server=child;
        const timer=setTimeout(()=>fail('Server start timed out (25 s)'),25000);
        const finish=(fn,value)=>{if(settled)return;settled=true;clearTimeout(timer);fn(value);};
        const fail=message=>{if(!child.killed)child.kill();finish(rejectReady,Error(message));};
        child.on('error',e=>fail(e.message));
        child.on('exit',(code,signal)=>fail('Server exited before ready: '+(code??signal)));
        child.stderr.on('data',d=>{const line=String(d);process.stderr.write(line);lastError+=line;});
        child.stdout.on('data',d=>{
          const line=String(d);buffer=(buffer+line).slice(-12000);
          const found=buffer.match(/Aktuelle URL:\s*(http:\/\/127\.0\.0\.1:\d+\/\?v=[^\s]+)/);
          if(found)finish(resolveReady,{child,url:found[1]});
        });
      });
    }catch(e){lastError=String(e.message);server=null;}
  }
  throw Error('Could not start Python server. Try python --version. '+lastError);
}
async function main(){
  if(Number(process.versions.node.split('.')[0])<22)
    throw Error('Node.js 22+ required. Your version: '+process.version);
  if(!existsSync(scene))throw Error('Reference scene missing: '+scene+
    '\nPull main (git pull --ff-only origin main) and check the tracked JSON file.');
  if(process.argv.includes('--url'))throw Error('The auto launcher selects a private local server port; do not supply --url.');
  console.log('Vedras Reiche – Schritt 13: automatischer 397-Hex-Renderingtest');
  console.log('Scene: '+scene);
  const started=await startServer();
  console.log('Isolated local server: '+started.url);
  const args=[
    resolve(repo,'scripts/rendering-step13-browser.mjs'),
    '--url',started.url,
    '--scene',scene,
    '--out',output,
    ...process.argv.slice(2)
  ];
  const test=spawn(process.execPath,args,{cwd:repo,stdio:'inherit'});
  const code=await new Promise((resolveExit,rejectExit)=>{
    test.once('error',rejectExit);
    test.once('close',code=>resolveExit(code??1));
  });
  stop();
  console.log('\nResults: '+output);
  if(process.platform==='win32'){
    try{
      const explorer=spawn('explorer.exe',[output],{detached:true,stdio:'ignore'});
      explorer.unref();
    }catch{}
  }
  if(code!==0)throw Error('Browser test exit status '+code+'. Read result.json in '+output);
  console.log('Measurement captured. Review map-only PNGs and README.md; visual correctness is not automatically certified.');
}
main().catch(e=>{stop();console.error('Step-13 automatic test failed: '+e.message);process.exitCode=1;}).finally(stop);
