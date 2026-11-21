'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),
 html=fs.readFileSync(path.join(root,'index.html'),'utf8');
test('failed native-4x tiles have explicit per-tile readiness and pixel diagnostics',()=>{
 assert(app.includes('const workQueue=all.slice(),retriedIds=new Set(),pixelIssues=new Map(),'));
 assert(app.includes("noteBlocked(tile,'quellvorbereitung'"));
 assert(app.includes("noteBlocked(tile,'renderfreigabe'"));
 assert(app.includes("noteBlocked(tile,'ground-pixelpruefung'"));
 assert(app.includes("noteBlocked(tile,'bake'"));
 assert(app.includes("blocked.delete(tile.id);found=true;break"));
 assert(app.includes("const missingDetails=audit.missingIds.map(id=>blocked.get(id)"));
 assert(app.includes("const invalidDetails=audit.invalidTiles.map(entry=>"));
 assert(app.includes("reasonGroups"));
 assert(app.includes("window.__vedrasLastFrozenExportReport"));
});
test('invalid PNGs remain unpublishable; reports never modify or clear stored 4x tiles',()=>{
 assert(app.includes("const audit=await frozenMap.verifyArchive(scene,'near',all,{require4x:true})"));
 assert(app.includes('const published=!run.cancel&&audit.complete&&seamAudit.complete'));
 assert(app.includes("if(!run.cancel&&audit.complete){"));
 assert(app.includes("Ground-Kernnähte NICHT geprüft (Archiv unvollständig)"));
 assert(!app.includes('frozenMap.storage.clearPrefix('));
 assert(!app.includes('indexedDB.deleteDatabase('));
 assert.doesNotThrow(()=>new Function(app),'after edits the main script must parse');
});
test('Firefox receives attached downloadable JSON with full tile reasons',()=>{
 assert(html.includes('id="frozenReportDownload"'));
 assert(html.includes('app.js?v=20261120-organic-v1&amp;diagnostics=20261121'));
 assert(app.includes("document.body.appendChild(link);link.click();link.remove()"));
 assert(app.includes("link.download='vedras_4x_fehler_'+report.scene+'.json'"));
 assert(app.includes("window.__vedrasLastFrozenExportReport=null"));
 assert(app.includes("$('frozenReportDownload').hidden=published"));
});
