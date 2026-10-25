document.querySelectorAll('a[target="_blank"]').forEach(link => { link.rel='noopener noreferrer'; });
// Remember only the last hobby page. No network request or personal data.
const nightLinks=document.querySelectorAll('[data-night-link]');
const currentPage=location.pathname.split('/').pop();
try {
  if(['games.html','anime.html'].includes(currentPage)) localStorage.setItem('last-night-page',currentPage);
  const previous=localStorage.getItem('last-night-page');
  if(['games.html','anime.html'].includes(previous)) nightLinks.forEach(link=>link.href=previous);
} catch {}
function pauseMedia(){document.querySelectorAll('audio,video').forEach(media=>media.pause());}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseMedia();});
window.addEventListener('pagehide',pauseMedia);
document.querySelectorAll('[data-audio-select]').forEach(select=>{
  const audio=document.getElementById(select.dataset.audioSelect);
  select.addEventListener('change',()=>{audio.pause();audio.src=select.value;audio.load();});
});
document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.querySelector('[data-close]')?.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
  });
});
