const works={
sao:{title:'Sword Art Online',genres:'Science fiction / Adventure',format:'wide',image:'sao',description:'Kirito and Asuna meet inside a virtual world where the rules of a game have become a matter of survival. The story follows the people and relationships that remain after the game changes.',official:'https://www.swordart-online.net/'},
re0:{title:'Re:Zero',genres:'Fantasy / Suspense',format:'poster',image:'re0',description:'Subaru finds himself in an unfamiliar world and discovers that death returns him to an earlier moment. Each attempt to change what happens forces him to understand the people around him a little better.',official:'https://re-zero-anime.jp/tv/'},
steinsgate:{title:'Steins;Gate',genres:'Science fiction / Suspense',format:'poster',image:'steinsgate',description:'A small group in Akihabara discovers a way to send information into the past. What begins as a series of odd experiments becomes a story about the consequences of changing a world line.',official:'https://steinsgate.tv/'},
onepunch:{title:'One-Punch Man',genres:'Action / Comedy',format:'poster',image:'onepunch',description:'Saitama can end almost any fight with one punch. His uneventful daily life sits beside increasingly elaborate battles, while the Hero Association tries to put order around a chaotic profession.',official:'https://onepunchman-anime.net/'}
};
const seriesButtons=[...document.querySelectorAll('[data-work]')];
const saveButton=document.getElementById('save-series');
let current='sao';let saved=new Set();
try {const value=JSON.parse(localStorage.getItem('anon-anime-bookmarks')||'[]');if(Array.isArray(value))saved=new Set(value.filter(key=>Object.hasOwn(works,key)));} catch {}
function updateSave(){const active=saved.has(current);saveButton.textContent=active?'Saved':'Save';saveButton.setAttribute('aria-pressed',String(active));saveButton.setAttribute('aria-label',(active?'Unsave ':'Save ')+works[current].title);}
function selectSeries(key){
 const work=works[key];if(!work)return;current=key;
 document.getElementById('feature-title').textContent=work.title;document.getElementById('feature-genres').textContent=work.genres;document.getElementById('feature-description').textContent=work.description;
 const image=document.getElementById('feature-image');image.src='assets/images/anime/'+work.image+'.webp';image.alt=work.title+' character artwork';
 document.getElementById('feature').dataset.format=work.format;document.getElementById('official-link').href=work.official;document.getElementById('open-poster').setAttribute('aria-label','Enlarge '+work.title+' artwork');
 seriesButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.work===key)));updateSave();document.title=work.title+' — M. Example';
}
function applyFilter(){
 const value=document.getElementById('work-filter').value;
 seriesButtons.forEach(button=>{button.hidden=value==='saved'?!saved.has(button.dataset.work):value!=='all'&&!button.dataset.category.split(' ').includes(value);});
 const visible=seriesButtons.filter(button=>!button.hidden);document.getElementById('filter-status').textContent=visible.length+' series';
 document.getElementById('empty-saved').hidden=visible.length>0;
 document.getElementById('feature').hidden=visible.length===0;
 if(visible.length&&!visible.some(button=>button.dataset.work===current))selectSeries(visible[0].dataset.work);
}
seriesButtons.forEach(button=>button.addEventListener('click',()=>selectSeries(button.dataset.work)));
document.getElementById('work-filter').addEventListener('change',applyFilter);
saveButton.addEventListener('click',()=>{
 const removing=saved.has(current);if(removing)saved.delete(current);else saved.add(current);
 let message=removing?'Removed from saved series.':'Saved in this browser.';
 try{localStorage.setItem('anon-anime-bookmarks',JSON.stringify([...saved]));}catch{message='Saved for this visit only.';}
 updateSave();applyFilter();document.getElementById('save-status').textContent=message;
});
document.getElementById('open-poster').addEventListener('click',()=>{
 const work=works[current];const image=document.getElementById('dialog-poster');image.src='assets/images/anime/'+work.image+'.webp';image.alt=work.title+' character artwork';document.getElementById('poster-caption').textContent=work.title;document.getElementById('poster-dialog').showModal();
});
updateSave();
