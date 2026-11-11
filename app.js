(function(){
var stack=document.getElementById('stack');
var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
var DOW=['SUN','MON','TUE','WED','THU','FRI','SAT'];
var now=new Date(),cur={y:now.getFullYear(),m:now.getMonth()};
var todayY=now.getFullYear(),todayM=now.getMonth(),todayD=now.getDate();
function mk(y,m){
 var p=document.createElement('div');p.className='page';
 var h='';
 for(var i=0;i<9;i++)h+='<i class="hole" style="left:'+(8+i*10.5)+'%"></i>';
 h+='<div class="head"><div class="year">'+y+'</div><div class="month">'+MONTHS[m]+'</div></div><div class="grid">';
 DOW.forEach(function(d){h+='<div class="dow">'+d+'</div>'});
 var first=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate();
 for(var i=0;i<first;i++)h+='<div class="day"></div>';
 for(var d=1;d<=n;d++){var wd=(first+d-1)%7;
  h+='<div class="day'+(wd==0?' sun':'')+(y==todayY&&m==todayM&&d==todayD?' today':'')+'">'+d+'</div>';}
 h+='</div>';p.innerHTML=h;
 p.dataset.y=y;p.dataset.m=m;return p;
}
function next(s){var m=s.m+1,y=s.y;if(m>11){m=0;y++}return{y:y,m:m}}
var pages=[];
function build(){
 stack.innerHTML='';pages=[];var s={y:cur.y,m:cur.m};
 for(var i=0;i<3;i++){var p=mk(s.y,s.m);stack.appendChild(p);pages.push(p);s=next(s)}
 layout();
}
function layout(){
 pages.forEach(function(p,i){p.style.zIndex=50-i;if(!p.classList.contains('gone'))p.style.transform='translateY('+(i*1.5)+'px)'});
}
function top(){return pages.find(function(p){return !p.classList.contains('gone')})}
var drag=null;
var H=function(){return stack.getBoundingClientRect().height};
function pt(e){return{x:e.clientX,y:e.clientY}}
function apply(p,t,dx){ // t 0..1 tear progress
 var ang=-t*75, ty=-t*20, rz=(dx/200)*8*t+t*3;
 p.style.transform='translate3d('+(dx*0.25)+'px,'+ty+'px,0) rotateX('+(-ang)+'deg) rotateZ('+rz+'deg)';
 p.style.transform='translate3d('+(dx*0.3)+'px,'+(-t*30)+'px,0) rotateX('+(t*70)+'deg) rotateZ('+rz+'deg)';
 p.style.boxShadow='0 '+(t*30)+'px '+(t*40)+'px rgba(0,0,0,'+(0.1+t*0.3)+')';
}
document.addEventListener('pointerdown',function(e){
 var p=top();if(!p||drag)return;
 drag={p:p,s:pt(e),t:0,id:e.pointerId,last:pt(e),lt:performance.now(),v:0};
 p.classList.add('tearing');p.style.transition='none';
});
document.addEventListener('pointermove',function(e){
 if(!drag)return;var c=pt(e),dx=c.x-drag.s.x,dy=c.y-drag.s.y;
 // swipe up, down or sideways all tear; use total travel
 var dist=Math.hypot(dx,dy);
 var t=Math.min(1,dist/(H()*0.45));
 var now=performance.now();drag.v=dist/(now-drag.lt+1)*0+ (Math.hypot(c.x-drag.last.x,c.y-drag.last.y)/(now-drag.lt+1));
 drag.last=c;drag.lt=now;drag.t=t;drag.dx=dx;
 apply(drag.p,t,dx);
});
function end(){
 if(!drag)return;var d=drag;drag=null;
 if(d.t>0.35||d.v>0.8&&d.t>0.08){tear(d.p,d.dx||0)}
 else{d.p.style.transition='transform .35s cubic-bezier(.2,.9,.3,1.3),box-shadow .35s';d.p.classList.remove('tearing');
  d.p.style.boxShadow='';d.p.style.transform='translateY(0)';
  setTimeout(function(){d.p.style.transition='';layout()},380)}
}
document.addEventListener('pointerup',end);
document.addEventListener('pointercancel',end);
function tear(p,dx){
 p.classList.add('gone');
 var dir=dx<0?-1:1;
 p.style.transition='transform .75s cubic-bezier(.5,0,.8,.6),opacity .75s ease-in';
 p.style.clipPath='polygon(0 3px,6% 0,13% 4px,21% 1px,30% 5px,38% 0,47% 4px,55% 1px,64% 5px,72% 0,81% 4px,90% 1px,100% 4px,100% 100%,0 100%)';
 requestAnimationFrame(function(){
  p.style.transform='translate3d('+(dir*120+dx*0.4)+'px,'+(H()*1.15)+'px,0) rotateX(60deg) rotateZ('+(dir*28)+'deg)';
  p.style.opacity='0';
 });
 setTimeout(function(){
  p.remove();pages=pages.filter(function(x){return x!==p});
  var l=pages[pages.length-1];var s=next({y:+l.dataset.y,m:+l.dataset.m});
  var np=mk(s.y,s.m);stack.appendChild(np);pages.push(np);layout();
 },780);
 pages.forEach(function(x){if(x!==p){x.style.transition='transform .4s ease'}});
 var rest=pages.filter(function(x){return x!==p});
 rest.forEach(function(x,i){x.style.zIndex=50-i;x.style.transform='translateY('+(i*1.5)+'px)'});
}
build();
document.addEventListener('keydown',function(e){if(e.key=='ArrowRight'||e.key=='ArrowUp'||e.key==' '||e.key=='Enter'){var p=top();if(p)tear(p,0)}});
})();
