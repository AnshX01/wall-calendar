(function(){
var stack=document.getElementById('stack');
function midnight(d){var x=new Date(d);x.setHours(0,0,0,0);return x}
var start=midnight(new Date());
function addDays(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x}
var BACK=8;
function H(){return stack.getBoundingClientRect().height}

function mk(date){
 var p=document.createElement('div');p.className='page';
 var stub=document.createElement('div');stub.className='stub';
 var hh='';for(var i=0;i<7;i++)hh+='<i class="hole" style="left:'+(10+i*13.3)+'%"></i>';
 stub.innerHTML=hh;
 var perf=document.createElement('div');perf.className='perf';
 var body=document.createElement('div');body.className='pbody';
 var sun=date.getDay()===0;
 body.innerHTML='<div class="num'+(sun?' sun':'')+'">'+date.getDate()+'</div>';
 p.appendChild(stub);p.appendChild(body);p.appendChild(perf);
 p.dataset.t=date.getTime();
 return p;
}

// jagged torn edge along the TOP of the body; amp 0 (flat) .. 1 (fully torn)
function jagClipTop(amp){
 var pts=[],N=26,i;
 for(i=0;i<=N;i++){
  var x=i/N*100;
  var env=0.45+0.55*(1-i/N);               // tear deeper toward the left
  var r=Math.abs(Math.sin(i*12.9898)*43758.5453%1);
  var y=(i%2? 0.55+0.45*r : 0.04+0.14*r)*amp*6*env;
  pts.push(x.toFixed(2)+'% '+y.toFixed(3)+'%');
 }
 pts.push('100% 100%','0% 100%');
 return 'polygon('+pts.join(',')+')';
}
// frayed bottom edge of the stub left behind in the binding
function stubFrayClip(){
 var pts=['0% 0%','100% 0%'],N=26,i;
 for(i=N;i>=0;i--){
  var x=i/N*100;
  var r=Math.abs(Math.sin(i*7.2331)*12543.127%1);
  var y=100-((i%2? 0.5+0.5*r : 0.03+0.12*r)*70);
  pts.push(x.toFixed(2)+'% '+y.toFixed(2)+'%');
 }
 return 'polygon('+pts.join(',')+')';
}

var pages=[];
function build(){
 stack.innerHTML='';pages=[];
 for(var i=0;i<BACK;i++){var p=mk(addDays(start,i));stack.appendChild(p);pages.push(p)}
 layout();
}
function live(){return pages.filter(function(p){return !p.classList.contains('spent')})}
function layout(){
 live().forEach(function(p,i){
  p.style.zIndex=60-i;
  p.style.filter='brightness('+(1-i*0.05)+')';
  p.style.transform='translate3d('+(i*2.2)+'px,'+(i*2.6)+'px,'+(-i*4)+'px)';
 });
}
function top(){return live()[0]}

function applyDrag(p,t,dx,dy){
 var body=p.querySelector('.pbody');
 var ox=Math.max(8,(1-t)*100);            // hinge slides left: tear runs left to right
 body.style.transformOrigin=ox+'% 0%';
 var rz=-t*14+dx*0.02;
 var rx=-t*52;
 var perf=p.querySelector('.perf');if(perf)perf.style.clipPath='inset(0 0 0 '+ox+'%)';
 var tx=dx*0.3,ty=dy*0.25+t*8;
 body.style.transition='none';
 body.style.transform='translate3d('+tx+'px,'+ty+'px,'+(t*55)+'px) rotateX('+rx+'deg) rotateZ('+rz+'deg)';
 body.style.boxShadow='0 '+(10+t*42)+'px '+(16+t*52)+'px rgba(0,0,0,'+(0.35+t*0.4)+')';
 body.style.clipPath=jagClipTop(t);
}

var drag=null;
function pt(e){return{x:e.clientX,y:e.clientY}}
document.addEventListener('pointerdown',function(e){
 var p=top();if(!p||drag)return;
 drag={p:p,s:pt(e),t:0,dx:0,dy:0,last:pt(e),lt:performance.now(),v:0};
});
document.addEventListener('pointermove',function(e){
 if(!drag)return;
 var c=pt(e),dx=c.x-drag.s.x,dy=c.y-drag.s.y;
 var dist=Math.hypot(dx,dy);
 var t=Math.min(1,dist/(H()*0.45));
 var now=performance.now();
 drag.v=Math.hypot(c.x-drag.last.x,c.y-drag.last.y)/(now-drag.lt+1);
 drag.last=c;drag.lt=now;drag.t=t;drag.dx=dx;drag.dy=dy;
 applyDrag(drag.p,t,dx,dy);
});
function end(){
 if(!drag)return;var d=drag;drag=null;
 if(d.t>0.33||(d.v>0.9&&d.t>0.12)){tear(d.p,d.dx||0)}
 else{
  var body=d.p.querySelector('.pbody');
  body.style.transition='transform .45s cubic-bezier(.25,.9,.3,1.4),clip-path .45s ease,box-shadow .45s';
  body.style.transform='translate3d(0,0,0)';
  body.style.clipPath=jagClipTop(0);
  body.style.boxShadow='';
  var perf=d.p.querySelector('.perf');if(perf)perf.style.clipPath='';
  setTimeout(function(){body.style.transition='';body.style.clipPath=''},480);
 }
}
document.addEventListener('pointerup',end);
document.addEventListener('pointercancel',end);
document.addEventListener('contextmenu',function(e){e.preventDefault()});

function tear(p,dx){
 var body=p.querySelector('.pbody');
 var stub=p.querySelector('.stub');
 p.classList.add('spent');
 p.style.zIndex=100;
 stub.style.clipPath=stubFrayClip();
 stub.style.filter='brightness(.9) drop-shadow(0 3px 3px rgba(0,0,0,.5))';
 var perf=p.querySelector('.perf');if(perf)perf.style.display='none';
 body.style.clipPath=jagClipTop(1);
 var dir=dx<0?-1:1;
 body.style.transition='transform .8s cubic-bezier(.4,0,.8,.4),opacity .4s ease-in .38s';
 requestAnimationFrame(function(){
  body.style.transformOrigin='50% 0%';
  body.style.transform='translate3d('+(dir*140+dx*0.4)+'px,'+(H()*1.15)+'px,90px) rotateX(-35deg) rotateZ('+(dir*30)+'deg)';
  body.style.opacity='0';
 });
 layout();
 setTimeout(function(){
  body.remove();
  var spent=pages.filter(function(x){return x.classList.contains('spent')});
  spent.slice(0,-1).forEach(function(x){x.remove();pages.splice(pages.indexOf(x),1)});
  var last=pages[pages.length-1];
  var np=mk(addDays(new Date(+last.dataset.t),1));
  stack.appendChild(np);pages.push(np);layout();
 },840);
}

build();

document.addEventListener('keydown',function(e){
 if(e.key=='ArrowRight'||e.key=='ArrowUp'||e.key==' '||e.key=='Enter'){var p=top();if(p)tear(p,0)}
});

// deterministic poses for visual testing: ?pose=idle|drag|tear|next&t=0.55&dx=40&dy=30
try{
 var q=new URLSearchParams(location.search),pose=q.get('pose');
 if(pose==='drag'){
  applyDrag(top(),parseFloat(q.get('t')||'0.55'),parseFloat(q.get('dx')||'40'),parseFloat(q.get('dy')||'30'));
 }else if(pose==='tear'){
  var p1=top(),b1=p1.querySelector('.pbody');
  p1.classList.add('spent');p1.style.zIndex=100;
  p1.querySelector('.stub').style.clipPath=stubFrayClip();
  p1.querySelector('.stub').style.filter='brightness(.9) drop-shadow(0 3px 3px rgba(0,0,0,.5))';
  p1.querySelector('.perf').style.display='none';
  b1.style.clipPath=jagClipTop(1);
  b1.style.transform='translate3d(96px,'+(H()*0.55)+'px,80px) rotateX(-28deg) rotateZ(17deg)';
  b1.style.opacity='0.85';
  b1.style.boxShadow='0 40px 60px rgba(0,0,0,.7)';
  layout();
 }else if(pose==='swipe'||pose==='swipesmall'){
  var big=pose==='swipe';
  var r=stack.getBoundingClientRect();
  var cx=r.left+r.width/2,cy=r.top+r.height/2;
  setTimeout(function(){
   document.dispatchEvent(new PointerEvent('pointerdown',{clientX:cx,clientY:cy,bubbles:true}));
   var d=(big?0.6:0.1)*r.height;
   for(var i=1;i<=10;i++)(function(i){setTimeout(function(){document.dispatchEvent(new PointerEvent('pointermove',{clientX:cx,clientY:cy+d*i/10,bubbles:true}))},i*60)})(i);
   setTimeout(function(){document.dispatchEvent(new PointerEvent('pointerup',{clientX:cx,clientY:cy+d,bubbles:true}))},700);
  },300);
 }else if(pose==='next'){
  var p2=top();
  p2.querySelector('.pbody').remove();
  p2.classList.add('spent');p2.style.zIndex=100;
  p2.querySelector('.stub').style.clipPath=stubFrayClip();
  p2.querySelector('.stub').style.filter='brightness(.9) drop-shadow(0 3px 3px rgba(0,0,0,.5))';
  p2.querySelector('.perf').style.display='none';
  layout();
 }
}catch(e){}
})();
