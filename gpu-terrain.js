'use strict';
/* WebGL2 compositor for precomputed terrain/relief tiles. Worker still
   generates terrain; CPU canvas draws shores, rivers, sprites and shadows. */
window.VedrasGpuTerrain=(()=>{
 const shader=(gl,type,src)=>{
  const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))
   throw Error(gl.getShaderInfoLog(s));
  return s;
 };
 function create(canvas,{maxBytes=128*1024*1024,maxTextures=112}={}){
  let gl,program,vao,vbo,view=null,loc;
  const textures=new Map();
  let ready=false,active=false,frame=0,reason='';
  const metrics={uploads:0,reused:0,evicted:0,draws:0,gpuBytes:0,peakGpuBytes:0,frames:0,failures:0};
  const reset=()=>{if(gl)for(const item of textures.values())gl.deleteTexture(item.texture);
   textures.clear();metrics.gpuBytes=0;};
  function disable(message){
   reset();active=false;ready=false;reason=String(message||'WebGL2 nicht verfügbar');
   metrics.failures++;canvas.style.display='none';
  }
  try{
   gl=canvas.getContext('webgl2',{alpha:false,antialias:false,depth:false,
    stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:false});
   if(!gl)throw Error('WebGL2 nicht verfügbar');
   const vs=shader(gl,gl.VERTEX_SHADER,
    '#version 300 es\nprecision highp float;\nlayout(location=0) in vec2 a_px;\nlayout(location=1) in vec2 a_uv;\nuniform vec2 u_size;\nout vec2 v_uv;\nvoid main(){v_uv=a_uv;gl_Position=vec4((a_px/u_size)*vec2(2.,-2.)+vec2(-1.,1.),0.,1.);}');
   const fs=shader(gl,gl.FRAGMENT_SHADER,
    '#version 300 es\nprecision mediump float;\nin vec2 v_uv;\nuniform sampler2D u_texture;\nout vec4 color;\nvoid main(){color=texture(u_texture,v_uv);}');
   program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);
   gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
   vao=gl.createVertexArray();gl.bindVertexArray(vao);
   vbo=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
   gl.bufferData(gl.ARRAY_BUFFER,64,gl.DYNAMIC_DRAW);
   gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,16,0);
   gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,2,gl.FLOAT,false,16,8);
   loc=gl.getUniformLocation(program,'u_size');
   gl.useProgram(program);gl.uniform1i(gl.getUniformLocation(program,'u_texture'),0);
   gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
   gl.disable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
   // ImageBitmap ignores UNPACK_FLIP_Y_WEBGL. Using an unflipped upload
   // for BOTH Canvas2D and ImageBitmap gives one consistent UV convention.
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
   gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
   canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();disable('GPU-Kontext verloren');});
   canvas.addEventListener('webglcontextrestored',()=>disable('GPU-Kontext muss neu initialisiert werden'));
   ready=true;
  }catch(e){disable(e.message);}
  function begin(nextView,pink=false){
   if(!ready)return false;
   try{
    view=nextView;frame++;active=true;
    if(canvas.width!==view.width)canvas.width=view.width;
    if(canvas.height!==view.height)canvas.height=view.height;
    gl.viewport(0,0,view.width,view.height);
    gl.bindVertexArray(vao);gl.useProgram(program);
    gl.uniform2f(loc,view.width,view.height);
    const rgb=pink?[236,39,241]:[135,154,129];
    gl.clearColor(rgb[0]/255,rgb[1]/255,rgb[2]/255,1);gl.clear(gl.COLOR_BUFFER_BIT);
    canvas.style.display='';return true;
   }catch(e){disable(e.message);return false;}
  }
  function textureFor(r){
   const source=r?.canvas;if(!source?.width||!source?.height)return null;
   let existing=textures.get(source);
   if(existing){textures.delete(source);textures.set(source,existing);existing.last=frame;metrics.reused++;return existing.texture;}
   if(source.width>gl.getParameter(gl.MAX_TEXTURE_SIZE)||source.height>gl.getParameter(gl.MAX_TEXTURE_SIZE))return null;
   const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);}
   catch(e){gl.deleteTexture(texture);throw e;}
   const bytes=source.width*source.height*4;
   textures.set(source,{texture,bytes,last:frame});metrics.gpuBytes+=bytes;
   metrics.peakGpuBytes=Math.max(metrics.peakGpuBytes,metrics.gpuBytes);metrics.uploads++;
   return texture;
  }
  function draw(r,core){
   if(!active||!ready||!r?.canvas)return false;
   try{
    const tex=textureFor(r);if(!tex)return false;
    const v=view,x0=Math.round((core.x*v.zoom+v.originX)*v.dpr),
     x1=Math.round(((core.x+core.size)*v.zoom+v.originX)*v.dpr),
     y0=Math.round((core.y*v.zoom*v.projectY+v.originY)*v.dpr),
     y1=Math.round(((core.y+core.size)*v.zoom*v.projectY+v.originY)*v.dpr);
    const sx=Math.max(0,(core.x-r.x)/r.width),ex=Math.min(1,(core.x+core.size-r.x)/r.width),
     sy=Math.max(0,(core.y-r.y)/r.height),ey=Math.min(1,(core.y+core.size-r.y)/r.height);
    if(x1<=x0||y1<=y0||ex<=sx||ey<=sy)return true;
    // Uploads are unflipped (including worker-transferred ImageBitmaps).
    // OpenGL's v=0 samples the first, top pixel row of an unflipped source.
    // Negating v flipped every worker chunk independently and produced
    // alternating horizontal landscape strips at 4-way intersections.
    const a=new Float32Array([x0,y0,sx,sy,x1,y0,ex,sy,x0,y1,sx,ey,x1,y1,ex,ey]);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferSubData(gl.ARRAY_BUFFER,0,a);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);metrics.draws++;return true;
   }catch(e){disable(e.message);return false;}
  }
  function end(){
   if(!active)return;active=false;metrics.frames++;
   for(const [canvas,item] of textures){
    if(textures.size<=maxTextures&&metrics.gpuBytes<=maxBytes)break;
    if(item.last===frame)continue;
    gl.deleteTexture(item.texture);textures.delete(canvas);metrics.gpuBytes-=item.bytes;metrics.evicted++;
   }
  }
  function hide(){active=false;canvas.style.display='none';}
  function stats(){return {...metrics,ready,active,reason,textureCount:textures.size,
   budgetBytes:maxBytes,renderer:'WebGL2'};}
  return {begin,draw,end,hide,stats,available:()=>ready};
 }
 return {create};
})();