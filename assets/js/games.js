const games={
ds1:{title:'Dark Souls',genre:'Action RPG',image:'darksouls1ptd',caption:'Dark Souls: Prepare to Die Edition',setting:'Lordran',focus:'Connected level design',description:'An interconnected world built around exploration, patient combat and the discovery of shortcuts. Firelink Shrine sits at the center of many of its routes.'},
ds1r:{title:'Dark Souls Remastered',genre:'Action RPG',image:'darksouls1remastered',caption:'Dark Souls Remastered',setting:'Lordran',focus:'A return to the original world',description:'The remastered edition of Dark Souls. The same journey through Lordran, with its branching routes, distant landmarks and familiar bonfires.'},
ds2:{title:'Dark Souls II',genre:'Action RPG',image:'darksouls2',caption:'Dark Souls II',setting:'Drangleic',focus:'Exploration and character builds',description:'A journey across Drangleic, beginning at the coastal settlement of Majula. Its different regions leave plenty of room to experiment with weapons and character builds.'},
ds3:{title:'Dark Souls III',genre:'Action RPG',image:'irithyll',caption:'Irithyll of the Boreal Valley',setting:'Lothric',focus:'Exploration and combat',description:'A journey through Lothric and the lands around it. Bonfires, shortcuts and interlinked paths give shape to its ruined world. Irithyll is one of its quieter, colder places.'},
eldenring:{title:'Elden Ring',genre:'Action RPG',image:'eldenring',caption:'Elden Ring',setting:'The Lands Between',focus:'Open-world exploration',description:'An open landscape connects castles, underground regions and smaller dungeons. Distant buildings and changes in terrain often become the next destination.'},
sekiro:{title:'Sekiro: Shadows Die Twice',genre:'Action adventure',image:'sekiro',caption:'Sekiro: Shadows Die Twice',setting:'Ashina',focus:'Deflection and movement',description:'A shinobi crosses a war-torn Ashina. Deflection, posture and the grappling hook give its sword fights and traversal a different rhythm from the Souls games.'},
wukong:{title:'Black Myth: Wukong',genre:'Action RPG',image:'wukong',caption:'Black Myth: Wukong',setting:'A world inspired by Journey to the West',focus:'Boss encounters and environments',description:'The Destined One travels through landscapes drawn from Chinese mythology. Staff combat, transformations and encounters with familiar legends shape the journey.'}
};
const indexButtons=[...document.querySelectorAll('.game-row')];
let selected='ds3';
function selectGame(key){
 const item=games[key];if(!item)return;selected=key;
 document.getElementById('game-title').textContent=item.title;
 document.getElementById('game-genre').textContent=item.genre;
 const image=document.getElementById('game-art');image.src='assets/images/games/'+item.image+'.webp';image.alt=item.caption;
 document.getElementById('art-caption').textContent=item.caption;
 document.getElementById('game-description').textContent=item.description;
 document.getElementById('game-setting').textContent=item.setting;
 document.getElementById('game-focus').textContent=item.focus;
 document.getElementById('open-art').setAttribute('aria-label','Enlarge '+item.title+' artwork');
 indexButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.game===key)));
 document.title=item.title+' — M. Example';
}
document.querySelectorAll('[data-game]').forEach(button=>button.addEventListener('click',()=>{
 const key=button.dataset.game;
 if(!button.classList.contains('game-row')){document.getElementById('game-filter').value='all';filterGames();}
 selectGame(key);
}));
function filterGames(){
 const filter=document.getElementById('game-filter').value;
 indexButtons.forEach(button=>{button.hidden=filter!=='all'&&button.dataset.category!==filter;});
 const visible=indexButtons.filter(button=>!button.hidden);
 document.getElementById('filter-status').textContent=visible.length+' games';
 if(!visible.some(button=>button.dataset.game===selected))selectGame(visible[0].dataset.game);
}
document.getElementById('game-filter').addEventListener('change',filterGames);
document.getElementById('open-art').addEventListener('click',()=>{
 const item=games[selected];const image=document.getElementById('dialog-art');image.src='assets/images/games/'+item.image+'.webp';image.alt=item.caption;
 document.getElementById('dialog-caption').textContent=item.caption;document.getElementById('art-dialog').showModal();
});
// Keep the same player available below the collection on small screens.
const music=document.querySelector('.audio-panel');
const mediaQuery=matchMedia('(max-width:700px)');
function placeMusic(){if(mediaQuery.matches){music.classList.add('mobile-music');document.querySelector('.library-main').append(music);}else{music.classList.remove('mobile-music');document.querySelector('.library-sidebar').append(music);}}
mediaQuery.addEventListener('change',placeMusic);placeMusic();
