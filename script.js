let tasks=JSON.parse(localStorage.tasks||'[]'),filter='all';
const list=document.getElementById('list');
function save(){localStorage.tasks=JSON.stringify(tasks);render();}
function render(){
const q=search.value.toLowerCase();list.innerHTML='';
tasks.filter(t=>(filter=='all'||(filter=='completed')==t.done)&&t.text.toLowerCase().includes(q))
.forEach((t,i)=>{
let li=document.createElement('li');
li.innerHTML=`<div><strong class='${t.done?"done":""}'>${t.text}</strong><br><small>${t.date||''}</small></div>
<div class='actions'>
<button onclick='toggle(${i})'>✔</button>
<button onclick='editTask(${i})'>✏</button>
<button onclick='del(${i})'>🗑</button></div>`;
list.appendChild(li);
});
}
add.onclick=()=>{
if(!task.value.trim())return;
tasks.push({text:task.value,date:datetime.value,done:false});
task.value='';datetime.value='';save();
}
function toggle(i){tasks[i].done=!tasks[i].done;save();}
function del(i){tasks.splice(i,1);save();}
function editTask(i){
let n=prompt('Edit Task',tasks[i].text);
if(n){tasks[i].text=n;save();}
}
search.oninput=render;
document.querySelectorAll('.filters button').forEach(b=>b.onclick=()=>{filter=b.dataset.f;render();});
theme.onclick=()=>document.body.classList.toggle('dark');
render();