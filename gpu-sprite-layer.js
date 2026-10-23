/* Vedras v0.16.0: optional WebGL2 compositor for the static scenery batch.
 * Terrain, roads and all editor input remain on the existing Canvas2D.
 * The entire alpha-composited sprite/shadow scene is ONE GPU texture/quad.
 * No GPU texture upload occurs for ordinary camera pans.
 */
'use strict';
window.VedrasGpuSprites=(()=>{
 function create(canvas){
  let gl=null,program=null,vao=null,vbo=null,uniform=null,texture=null,source=null;
  let ready=false,active=false,reason='',uploads=0,draws=0,frames=0,failures=0;
  function hide(){active=false;canvas.style.display='none';}
  function fail(error){
   reason=String(error?.message||error||'GPU-Kompositor nicht verfügbar');
   failures++;ready=false;hide();
   if(gl&&texture)gl.deleteTexture(texture);
   texture=null;source=null;
  }
  function shader(type,text){
   const s=gl.createShader(type);gl.shaderSource(s,text);gl.compileShader(s);
   if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));
   return s;
  }
  try{
   gl=canvas.getContext('webgl2',{alpha:true,antialias:false,
    depth:false,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:false});
   if(!gl)throw Error('WebGL2 nicht verfügbar');
   const vert=shader(gl.VERTEX_SHADER,
    '#version 300 es\nprecision highp float;\nlayout(location=0) in vec2 a_pos;\nlayout(location=1) in vec2 a_uv;\nuniform vec2 u_size;\nout vec2 v_uv;\nvoid main(){v_uv=a_uv;gl_Position=vec4(a_pos/u_size*vec2(2.,-2.)+vec2(-1.,1.),0.,1.);}');
   const frag=shader(gl.FRAGMENT_SHADER,
    '#version 300 es\nprecision mediump float;\nin vec2 v_uv;\nuniform sampler2D u_tex;\nout vec4 color;\nvoid main(){color=texture(u_tex,v_uv);}');
   program=gl.createProgram();gl.attachShader(program,vert);gl.attachShader(program,frag);
   gl.linkProgram(program);gl.deleteShader(vert);gl.deleteShader(frag);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))
    throw Error(gl.getProgramInfoLog(program));
   vao=gl.createVertexArray();gl.bindVertexArray(vao);
   vbo=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
   gl.bufferData(gl.ARRAY_BUFFER,64,gl.DYNAMIC_DRAW);
   gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,16,0);
   gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,2,gl.FLOAT,false,16,8);
   uniform=gl.getUniformLocation(program,'u_size');
   gl.useProgram(program);
   gl.uniform1i(gl.getUniformLocation(program,'u_tex'),0);
   gl.disable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
   gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
   canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fail('WebGL-Kontext verloren');});
   canvas.addEventListener('webglcontextrestored',()=>fail('Neustart des GPU-Kontexts erforderlich'));
   ready=true;hide();
  }catch(error){fail(error);}
  function draw(image,view){
   if(!ready||!image?.width||!image?.height)return false;
   try{
    if(image.width>gl.getParameter(gl.MAX_TEXTURE_SIZE)||
     image.height>gl.getParameter(gl.MAX_TEXTURE_SIZE))return false;
    if(canvas.width!==Math.round(view.width*view.dpr))
     canvas.width=Math.round(view.width*view.dpr);
    if(canvas.height!==Math.round(view.height*view.dpr))
     canvas.height=Math.round(view.height*view.dpr);
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(vao);gl.useProgram(program);
    gl.uniform2f(uniform,canvas.width,canvas.height);
    if(image!==source){
     if(texture)gl.deleteTexture(texture);
     texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
     gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
     gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
     gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
     gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
     gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
     source=image;uploads++;
    }else gl.bindTexture(gl.TEXTURE_2D,texture);
    const x=view.dx*view.dpr,y=view.dy*view.dpr,w=image.width,h=image.height;
    const verts=new Float32Array([x,y,0,0,x+w,y,1,0,
     x,y+h,0,1,x+w,y+h,1,1]);
    gl.activeTexture(gl.TEXTURE0);gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
    gl.bufferSubData(gl.ARRAY_BUFFER,0,verts);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);draws++;frames++;
    active=true;canvas.style.display='block';
    return true;
   }catch(error){fail(error);return false;}
  }
  function stats(){return {ready,active,reason,uploads,draws,frames,failures,
   gpuBytes:source?.width*source?.height*4||0,renderer:'WebGL2 static scene'};}
  return {draw,hide,stats,available:()=>ready};
 }
 return {create};
})();
