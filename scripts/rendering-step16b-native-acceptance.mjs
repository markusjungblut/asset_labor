/* Step 16B native Node acceptance evidence.
 * Read-only test run; never resets Git, deletes audit assets or changes
 * renderer budgets. One unique evidence directory per invocation.
 */
import {spawn,execFileSync} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createWriteStream,existsSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {once} from 'node:events';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const testFiles=[
 'tests/test_rendering_step16b_ground_asset_dependencies_20261030.cjs',
 'tests/test_rendering_step16b_retained_stale_ground_20261030.cjs',
 'tests/test_rendering_step16b_stable_road_river_revisions_20261030.cjs',
 'tests/test_rendering_step16b_image_content_lifecycle_20261030.cjs',
 'tests/test_rendering_step16b_warm_trajectory_20261030.cjs',
 'tests/test_rendering_step16b_camera_union_20261031.cjs',
 'tests/test_rendering_step16b_raster_footprint_20261031.cjs',
 'tests/test_rendering_step16b_lossless_scenery_crop_20261031.cjs',
 'tests/test_rendering_step16b_global_image_refresh_20261101.cjs',
 'tests/test_rendering_step16b_live_near_readiness_20261101.cjs',
 'tests/test_rendering_step16b_idle_visible_chunk_parallelism_20261101.cjs',
 'tests/test_rendering_step16b_offscreen_does_not_steal_streamer_20261101.cjs',
 'tests/test_rendering_step16b_stable_terrain_shore_revisions_20261101.cjs',
 'tests/test_rendering_step16b_quick_terrain_preview_20261101.cjs',
 'tests/test_rendering_step17_frozen_game_map_20261101.cjs'
];
function git(...args){
 try{return execFileSync('git',args,{cwd:root,encoding:'utf8',
  stdio:['ignore','pipe','ignore']}).trim();}catch{return null;}
}
function uniqueTimestamp(){
 return new Date().toISOString().replace(/[:.]/g,'-')+'-pid'+process.pid;
}
function tapCount(raw,key){
 const m=raw.match(new RegExp('(?:^|\\n)# '+key+' (\\d+)(?:\\r?\\n|$)','g'));
 if(!m?.length)return null;
 const last=m[m.length-1];
 return Number(last.match(new RegExp('# '+key+' (\\d+)'))?.[1]);
}
function quotePS(s){return "'"+s.replace(/'/g,"''")+"'";}
async function archiveWithWindowsPowerShell(dir){
 if(process.platform!=='win32')return {status:'unsupported-platform'};
 const dest=dir+'.zip';
 const command='Compress-Archive -LiteralPath '+quotePS(dir)+
  ' -DestinationPath '+quotePS(dest)+' -Force -ErrorAction Stop';
 return await new Promise(resolve=>{
  const child=spawn('powershell.exe',['-NoProfile','-NonInteractive',
   '-Command',command],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});
  let diagnostics='';
  child.stderr.on('data',b=>{diagnostics+=b.toString().slice(0,3000);});
  child.on('error',error=>resolve({status:'failed',error:String(error)}));
  child.on('close',code=>resolve(code===0?
   {status:'created',path:dest}:
   {status:'failed',exitCode:code,error:diagnostics.slice(0,3000)}));
 });
}
async function run(){
 if(process.argv.includes('--help')||process.argv.includes('--list')){
  console.log('Step 16B Windows-native Node acceptance tests');
  console.log(testFiles.join('\n'));
  console.log('Run without arguments to collect a unique test transcript and ZIP.');
  return;
 }
 if(process.argv.length>2)throw Error('No extra arguments supported. Use --list.');
 const missing=testFiles.filter(p=>!existsSync(join(root,p)));
 if(missing.length)throw Error('Missing required native test file(s): '+missing.join(', '));
 const artifacts=join(root,'artifacts');
 await mkdir(artifacts,{recursive:true});
 const folder=join(artifacts,'rendering-step16b-native-'+uniqueTimestamp());
 await mkdir(folder); // Never reuse or overwrite a previous evidence directory.
 const startedAt=new Date().toISOString();
 const sha=git('rev-parse','HEAD'),branch=git('branch','--show-current');
 const changes=git('status','--porcelain')||'';
 const args=['--test','--test-reporter=tap',...testFiles];
 const logPath=join(folder,'node-tests.tap');
 const log=createWriteStream(logPath,{flags:'wx'});
 let output='',logBytes=0,exitCode=null,spawnError=null;
 const MAX_OUTPUT=4_000_000;
 const child=spawn(process.execPath,args,{
  cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']
 });
 const pipeChunk=(channel)=>(chunk)=>{
  const txt=chunk.toString('utf8');
  if(logBytes<MAX_OUTPUT){
   const remaining=MAX_OUTPUT-logBytes;
   const fragment=txt.slice(0,remaining);
   log.write(channel==='stderr'?'[stderr] '+fragment:fragment);
   output+=fragment;logBytes+=fragment.length;
  }
  (channel==='stderr'?process.stderr:process.stdout).write(chunk);
 };
 child.stdout.on('data',pipeChunk('stdout'));
 child.stderr.on('data',pipeChunk('stderr'));
 child.on('error',e=>{spawnError=String(e);});
 exitCode=await new Promise(resolve=>child.on('close',(code)=>resolve(code??1)));
 log.end();await once(log,'finish');
 const counts=Object.fromEntries(['tests','pass','fail','cancelled','skipped'].map(
  name=>[name,tapCount(output,name)]));
 // Current Step16B acceptance suite: 139 deterministic cases in fifteen files.
 // Do not accept partial success if a file/test silently disappears.
 const passed=!spawnError&&exitCode===0&&
  counts.tests===139&&counts.pass===139&&counts.fail===0&&
  counts.skipped===0&&counts.cancelled===0;
 const result={schema:1,startedAt,finishedAt:new Date().toISOString(),
  sceneAuditReference:'397-hex / 2631-nature / three valid 2026-10-31 warm audits',
  platform:process.platform,nodeVersion:process.version,
  branch,sha,worktreeDirty:changes.length>0,
  changedPaths:changes.split(/\r?\n/).filter(Boolean).slice(0,200),
  command:[process.execPath,...args],testFiles,counts,
  exitCode,spawnError,passed,
  warnings:passed?[]:['Native regression evidence not accepted; inspect node-tests.tap'],
  logFile:'node-tests.tap'};
 await writeFile(join(folder,'result.json'),JSON.stringify(result,null,2)+'\n');
 await writeFile(join(folder,'README.md'),
  '# Schritt 16B: nativer Node-Regressionsnachweis\n\n'+
  '- Status: **'+(passed?'PASS':'FAIL / UNCONFIRMED')+'**\n'+
  '- Git SHA: `'+(sha||'unavailable')+'`\n'+
  '- Node: `'+process.version+'`\n'+
  '- Tests: '+String(counts.tests)+', passed '+String(counts.pass)+
  ', failed '+String(counts.fail)+', skipped '+String(counts.skipped)+'\n'+
  '- Ergebnis: `result.json`, vollständiges Protokoll: `node-tests.tap`\n'+
  '- Originale Rendering-Auditordner und Dateien bleiben unverändert.\n');
 const archive=await archiveWithWindowsPowerShell(folder);
 console.log('\nNative Step16B tests: '+(passed?'PASS':'FAIL / UNCONFIRMED'));
 console.log('Evidence directory: '+folder);
 console.log('ZIP: '+(archive.status==='created'?archive.path:
  'not generated ('+archive.status+'); share evidence directory manually'));
 if(!passed)process.exitCode=1;
}
run().catch(err=>{console.error('Step 16B native test runner:',err);
 process.exitCode=1;});
