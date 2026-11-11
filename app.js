(function(){
var stack=document.getElementById('stack');
var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
var DOW=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
function midnight(d){var x=new Date(d);x.setHours(0,0,0,0);return x}
var start=midnight(new Date());
function addDays(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x}
function mk(date){
 var p=document.createElement('div');p.className='page';
 var sun=date.getDay()===0;
 var h='';
 for(var i=0;i<7;i++)h+='<i class="hole" style="left:'+(10+i*13.3)+'%"></i>';
 h+='<div class="dow">'+DOW[date.getDay()]+'</div>';
 h+='<div class="num'+(sun?' sun':'')+'">'+date.getDate()+'</div>';
 h+='<div class="rule"></div>';
 h+='<div class="mon">'+MONTHS[date.getMonth()]+' '+date.getFullYear()+'</div>';
 p.innerHTML=h;p.dataset.t=date.getTime();return p;
}
var pages=[];
function build(){
 stack.innerHTML='';pages=[];
 for(var i=0;i<3;i++){var p=mk(addDays(start,i));stack.appendChild(p);pages.push(p)}
 layout();
}
function layout(){
 pages.forEach(function(p,i){
  p.style.zIndex=50-i;
  p.style.filter='brightness('+(1-i*0.045)+')';
  if(!p.classList.contains('gone'))
   p.style.transform='translate3d('+(i*1.4)+'px,'+(i*2.2)+'px,'+(-i*10)+'px)';
 });
}
function top(){return pages.find(function(p){return !p.classList.contains('gone')})}
var drag=null;
function H(){return stack.getBoundingClientRect().height}
function pt(e){return{x:e.clientX,y:e.clientY}}
function apply(p,t,dx,dy){
 var rz=Math.max(-14,Math.min(14,dx*0.035));
 var tx=dx*0.35, ty=dy*0.35-t*12;
 p.style.transform='translate3d('+tx+'px,'+ty+'px,'+(t*40)+'px) rotateX('+(-t*58)+'deg) rotateZ('+rz+'deg)';
 p.style.boxShadow='0 '+(t*48)+'px '+(t*64)+'px rgba(0,0,0,'+(0.3+t*0.5)+')';
}
document.addEventListener('pointerdown',function(e){
 var p=top();if(!p||drag)return;
 drag={p:p,s:pt(e),t:0,dx:0,dy:0,last:pt(e),lt:performance.now(),v:0};
 p.classList.add('tearing');p.style.transition='none';
});
document.addEventListener('pointermove',function(e){
 if(!drag)return;
 var c=pt(e),dx=c.x-drag.s.x,dy=c.y-drag.s.y;
 var dist=Math.hypot(dx,dy);
 var t=Math.min(1,dist/(H()*0.5));
 var now=performance.now();
 drag.v=Math.hypot(c.x-drag.last.x,c.y-drag.last.y)/(now-drag.lt+1);
 drag.last=c;drag.lt=now;drag.t=t;drag.dx=dx;drag.dy=dy;
 apply(drag.p,t,dx,dy);
});
function end(){
 if(!drag)return;var d=drag;drag=null;
 if(d.t>0.32||(d.v>0.9&&d.t>0.1)){tear(d.p,d.dx||0)}
 else{
  d.p.style.transition='transform .35s cubic-bezier(.2,.9,.3,1.35),box-shadow .35s';
  d.p.classList.remove('tearing');d.p.style.boxShadow='';
  d.p.style.transform='translate3d(0,0,0)';
  setTimeout(function(){d.p.style.transition='';layout()},380);
 }
}
document.addEventListener('pointerup',end);
document.addEventListener('pointercancel',end);
document.addEventListener('contextmenu',function(e){e.preventDefault()});
function tear(p,dx){
 p.classList.add('gone');
 var dir=dx<0?-1:1;
 p.style.transition='transform .8s cubic-bezier(.45,0,.85,.5),opacity .45s ease-in .22s,clip-path .1s linear';
 p.style.clipPath='polygon(0 5%,5% 2.5%,11% 5.5%,18% 3%,26% 6%,33% 2.5%,41% 5.5%,49% 3%,57% 6%,65% 2.5%,73% 5.5%,81% 3%,89% 5.5%,95% 3%,100% 5%,100% 100%,0 100%)';
 requestAnimationFrame(function(){
  p.style.transform='translate3d('+(dir*170+dx*0.5)+'px,'+(H()*1.3)+'px,60px) rotateX(-28deg) rotateZ('+(dir*34)+'deg)';
  p.style.opacity='0';
 });
 var rest=pages.filter(function(x){return x!==p});
 rest.forEach(function(x,i){
  x.style.transition='transform .4s ease';
  x.style.zIndex=50-i;
  x.style.transform='translate3d('+(i*1.4)+'px,'+(i*2.2)+'px,'+(-i*10)+'px)';
 });
 setTimeout(function(){
  p.remove();pages=pages.filter(function(x){return x!==p});
  var l=pages[pages.length-1];
  var np=mk(addDays(new Date(+l.dataset.t),1));
  stack.appendChild(np);pages.push(np);layout();
 },820);
}
build();
document.addEventListener('keydown',function(e){
 if(e.key=='ArrowRight'||e.key=='ArrowUp'||e.key==' '||e.key=='Enter'){var p=top();if(p)tear(p,0)}
});
})();
