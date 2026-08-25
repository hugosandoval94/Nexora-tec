const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);

const menu=$("#menu"), nav=$("#nav");
menu?.addEventListener("click",()=>{nav.classList.toggle("mobile"); document.body.classList.toggle("nav-open")});
$$("nav a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("mobile");document.body.classList.remove("nav-open")}));

const sections=[...$$("main section[id]")], links=[...$$("nav a")];
const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){links.forEach(l=>l.classList.toggle("active",l.getAttribute("href")==="#"+e.target.id))}}),{rootMargin:"-35% 0px -55% 0px"});
sections.forEach(s=>obs.observe(s));

const led=$("#ledBoard"), patterns={
heart:["00100","01110","11111","01110","00100"],
smile:["00000","01010","00000","10001","01110"],
off:["00000","00000","00000","00000","00000"]};
for(let i=0;i<25;i++){const d=document.createElement("i");d.className="led";led.appendChild(d)}
function setLed(name){[...led.children].forEach((d,i)=>{const r=patterns[name][Math.floor(i/5)][i%5];d.classList.toggle("on",r==="1")})}
setLed("heart"); $$("[data-led]").forEach(b=>b.onclick=()=>setLed(b.dataset.led));

const code=$("#code"), output=$("#output");
function safeRun(v){
  v=v.trim();
  let m=v.match(/^print\("([\s\S]*)"\)$/); if(m)return m[1];
  m=v.match(/^print\((\d+)\s*([+*\/-])\s*(\d+)\)$/);
  if(m){let a=+m[1],b=+m[3];return String({"+":a+b,"-":a-b,"*":a*b,"/":b?a/b:"Error"}[m[2]])}
  return "Solo se permiten ejemplos print() sencillos.";
}
$("#run").onclick=()=>output.textContent="> "+safeRun(code.value);
$("#clear").onclick=()=>{code.value="";output.textContent="> esperando ejecución..."};
$$(".examples button").forEach(b=>b.onclick=()=>{code.value=b.dataset.code;output.textContent="> listo para ejecutar..."});

const canvas=$("#game"),ctx=canvas.getContext("2d"),scoreEl=$("#score");
let player=450,score=0,playing=true,keys={};
function drawGame(){
  ctx.clearRect(0,0,900,360);
  ctx.fillStyle="#0e0e12";ctx.fillRect(0,0,900,360);
  ctx.strokeStyle="#7047e8";ctx.lineWidth=16;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(70,285);ctx.bezierCurveTo(220,60,420,330,590,120);ctx.bezierCurveTo(700,40,760,250,830,90);ctx.stroke();
  ctx.strokeStyle="#b9a2ff";ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle="#27b9c9";ctx.fillRect(player-14,250,28,24);ctx.fillStyle="#fff";ctx.fillRect(player-8,245,5,5);ctx.fillRect(player+3,245,5,5);
  if(playing){if(keys.ArrowLeft||keys.a)player-=3;if(keys.ArrowRight||keys.d)player+=3;player=Math.max(25,Math.min(875,player));score++;scoreEl.textContent=Math.floor(score/10);requestAnimationFrame(drawGame)}
}
addEventListener("keydown",e=>keys[e.key]=true);addEventListener("keyup",e=>keys[e.key]=false);
$("#restart").onclick=()=>{player=450;score=0;scoreEl.textContent=0;playing=true;drawGame()}; drawGame();

const belt=$(".belt"), count=$("#count");let beltOn=false,timer;
$("#beltStart").onclick=()=>{beltOn=true;belt.classList.add("running");clearInterval(timer);timer=setInterval(()=>count.textContent=+count.textContent+1,4000)};
$("#beltPause").onclick=()=>{beltOn=false;belt.classList.remove("running");clearInterval(timer)};
$("#beltReset").onclick=()=>{beltOn=false;belt.classList.remove("running");clearInterval(timer);count.textContent=0};
$("#speed").oninput=e=>belt.style.setProperty("--belt-speed",`${11-e.target.value/2}s`);

const lab=$(".gripper-lab"),status=$("#gripStatus");
function grip(state){lab.classList.toggle("closed",state==="closed"||state==="grabbed");lab.classList.toggle("grabbed",state==="grabbed");status.textContent="Estado: "+({open:"abierta",closed:"cerrada",grabbed:"objeto agarrado"}[state]||"abierta")}
$("#openGrip").onclick=()=>grip("open");$("#closeGrip").onclick=()=>grip("closed");$("#grabGrip").onclick=()=>grip("grabbed");$("#dropGrip").onclick=()=>grip("open");

const visitorCount=$("#visitorCount"),badgeCore=$("#badgeCore"),quizQuestion=$("#quizQuestion"),quizOptions=$("#quizOptions"),quizFeedback=$("#quizFeedback");

const quizBank=[
{q:'Un visitante pregunta: "¿Qué proyecto usa sensores para seguir una línea sin ayuda de una persona?"',opts:["Cinta transportadora LEGO","Robot seguidor de línea","Robot con pinzas"],correct:1},
{q:'Un visitante pregunta: "¿Con qué lenguaje se programó el mini laboratorio de código?"',opts:["Python","HTML","C++"],correct:0},
{q:'Un visitante pregunta: "¿Qué placa electrónica se usó para el sistema de la matriz LED?"',opts:["Arduino Uno","Raspberry Pi","micro:bit"],correct:2},
{q:'Un visitante pregunta: "¿Qué mecanismo transporta objetos de un punto a otro de forma continua?"',opts:["Robot con pinzas","Cinta transportadora LEGO","Robot esquiva obstáculos"],correct:1},
{q:'Un visitante pregunta: "¿Qué robot sujeta y mueve objetos usando un mecanismo de agarre?"',opts:["Robot con pinzas","Robot seguidor de línea","Micro:bit"],correct:0},
{q:'Un visitante pregunta: "¿Qué robot recorre una pista de conos tomando decisiones para no chocar?"',opts:["Cinta transportadora LEGO","Robot esquiva obstáculos","Mini laboratorio de Python"],correct:1},
];
let quizIndex=-1;

function bumpBadge(){badgeCore.classList.remove("bump");void badgeCore.offsetWidth;badgeCore.classList.add("bump")}

function loadQuiz(){
  quizIndex=(quizIndex+1)%quizBank.length;
  const item=quizBank[quizIndex];
  quizQuestion.textContent=item.q;
  quizFeedback.textContent="\u00a0";
  quizOptions.innerHTML="";
  item.opts.forEach((opt,i)=>{
    const b=document.createElement("button");
    b.textContent=opt;
    b.onclick=()=>answerQuiz(i,item.correct,b);
    quizOptions.appendChild(b);
  });
}

function answerQuiz(i,correctIndex,btn){
  [...quizOptions.children].forEach(b=>b.disabled=true);
  if(i===correctIndex){
    btn.classList.add("correct");
    quizFeedback.textContent="¡Correcto! El visitante quedó satisfecho.";
    visitorCount.textContent=+visitorCount.textContent+1;
    bumpBadge();
  }else{
    btn.classList.add("wrong");
    quizOptions.children[correctIndex].classList.add("correct");
    quizFeedback.textContent="Casi. La respuesta correcta se resalta arriba.";
  }
  setTimeout(loadQuiz,1600);
}

loadQuiz();
$("#resetVisitor")?.addEventListener("click",()=>{visitorCount.textContent=0;quizIndex=-1;loadQuiz()});

document.querySelectorAll("img").forEach(img=>img.addEventListener("error",()=>img.style.background="#ddd"));
