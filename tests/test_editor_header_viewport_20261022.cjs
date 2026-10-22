'use strict';
// Regression: the document may restore a prior root scroll offset when the
// desktop editor is a full-height scroll-locked viewport application.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'style.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const desktop=css.slice(css.lastIndexOf('/* v0.12.9:'));

test('topbar with re-read and folder import is still present in the DOM',()=>{
 const header=html.match(/<header class="topbar">([\s\S]*?)<\/header>/);
 assert.ok(header,'topbar must not be removed');
 assert.match(header[1],/id="reloadBtn"[^>]*>↻ Neu einlesen/);
 assert.match(header[1],/for="folderInput">Ordner importieren/);
 assert.match(html,/class="layout"/);
});
test('desktop shell is pinned to viewport independently of browser scroll restoration',()=>{
 assert.match(desktop,/@media\s*\(min-width:801px\)/);
 assert.match(desktop,/\.app\s*\{[\s\S]*?position:fixed;inset:0;/);
 assert.match(desktop,/html,body\s*\{[^}]*overflow:hidden/);
 assert.match(desktop,/\.topbar\s*\{[^}]*min-height:70px;flex:0 0 70px/);
 assert.match(desktop,/#reloadBtn,\.toptools>\.button\{flex:0 0 auto;white-space:nowrap\}/);
});
test('side panels still scroll and central map remains inside fixed-height layout',()=>{
 assert.match(desktop,/\.layout\s*\{[^}]*flex:1 1 0%;[^}]*min-height:0;overflow:hidden/);
 assert.match(desktop,/\.library,\.inspector\{overflow-x:hidden;overflow-y:auto/);
 assert.match(desktop,/\.footer\{flex:0 0 auto\}/);
 assert.match(html,/style\.css\?v=0\.36\.0/);
 // Desktop locking is NOT unconditional: the existing narrow-screen
 // CSS retains the mobile document flow.
 assert.match(css,/@media\(max-width:800px\)\{\.layout\{display:flex;flex-direction:column;height:auto/);
});
