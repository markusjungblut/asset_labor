'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const {join}=require('node:path');
const script=join(__dirname,'../scripts/rendering-step13-browser.mjs');
function call(...args){return spawnSync(process.execPath,[script,...args],{encoding:'utf8',timeout:8000});}
test('Step-13 browser capture documents its CLI without starting Chrome',()=>{
 const run=call('--help');
 assert.equal(run.status,0,run.stderr);
 assert.match(run.stdout,/--scene FILE/);
 assert.match(run.stdout,/local Asset-Labor/);
});
test('refuses remote debugging against non-local sites',()=>{
 const run=call('--url','https://example.com');
 assert.notEqual(run.status,0);
 assert.match(run.stderr,/Only a local http:/);
});
test('rejects unsupported quality modes before spawning a browser',()=>{
 const run=call('--qualities','7');
 assert.notEqual(run.status,0);
 assert.match(run.stderr,/Invalid --qualities/);
});
test('requires bounded gesture duration',()=>{
 const run=call('--duration','20');
 assert.notEqual(run.status,0);
 assert.match(run.stderr,/Invalid duration/);
});
