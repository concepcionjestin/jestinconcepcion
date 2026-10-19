// Scroll-driven animation. No external libraries required.
const drive = document.querySelector('.drive');
const scene = document.querySelector('.drive-sticky');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let queued = false;
function updateDrive(){
  queued = false;
  if (reducedMotion.matches) { scene.style.setProperty('--progress', 0); return; }
  const rect = drive.getBoundingClientRect();
  const scrollDistance = Math.max(1, drive.offsetHeight - window.innerHeight + 74);
  const progress = Math.max(0, Math.min(1, -rect.top / scrollDistance));
  scene.style.setProperty('--progress', progress.toFixed(4));
}
window.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(updateDrive)}},{passive:true});
window.addEventListener('resize',updateDrive);
updateDrive();

// Filter project cards.
document.querySelectorAll('.filters button').forEach(button=>{
  button.addEventListener('click',()=>{
    document.querySelectorAll('.filters button').forEach(b=>b.classList.remove('active'));
    button.classList.add('active');
    document.querySelectorAll('.project').forEach(card=>{
      card.hidden = button.dataset.filter!=='all' && !card.dataset.category.split(' ').includes(button.dataset.filter);
    });
  });
});

// Interactive project detail dialogs.
const projects = {
  thermal:{category:'EMBEDDED SYSTEMS',title:'Thermal Occupancy Detection',description:'ESP32-based doorway occupancy monitoring system.',points:['Integrated thermal sensing with a microcontroller.','Evaluated counting accuracy under different walking scenarios.','Identified limitations when two people move close together.','Explored higher-resolution sensing and PCB integration.']},
  solar:{category:'OPTOELECTRONICS',title:'Kesterite Solar Cell Research',description:'Investigation of kesterite photovoltaic materials and device limitations.',points:['Studied open-circuit voltage deficits.','Considered material stability and photovoltaic efficiency.','Explored possible device improvements.']},
  glove:{category:'OPTICS',title:'Optical Fiber Data Glove',description:'Optical sensing concept for finger movement.',points:['Considered optical fibers, LED illumination, and photodetection.','Explored light distribution across multiple sensing fibers.','Developed preliminary hardware options and budget.']},
  headlight:{category:'AUTOMOTIVE / OPTICS',title:'Adaptive Headlight System',description:'Automotive illumination concept using selective beam control.',points:['Investigated illumination matrices and tunable lenses.','Considered changing driving conditions.','Developed preliminary design and component budget.']}
};
const dialog=document.getElementById('project-dialog');
document.querySelectorAll('.details').forEach(button=>button.addEventListener('click',()=>{
  const p=projects[button.dataset.project];
  document.getElementById('dialog-category').textContent=p.category;
  document.getElementById('dialog-title').textContent=p.title;
  document.getElementById('dialog-description').textContent=p.description;
  const list=document.getElementById('dialog-list');list.replaceChildren();
  p.points.forEach(point=>{const li=document.createElement('li');li.textContent=point;list.appendChild(li)});
  dialog.showModal();
}));
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
document.getElementById('year').textContent=new Date().getFullYear();
