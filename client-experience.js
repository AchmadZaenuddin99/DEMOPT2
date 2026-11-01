/* Local navigation only. No network, tracking, HTML injection or business-state changes. */
(()=>{'use strict';
 const header=document.getElementById('pc-header');if(!header)return;
 const shell=document.getElementById('pc-shell'),panel=document.getElementById('pc-panel');
 const toggle=document.getElementById('pc-menu-toggle'),finder=document.getElementById('pc-pages');
 const sectionFilter=document.getElementById('pc-search-section');
 const search=document.getElementById('pc-search'),status=document.getElementById('pc-search-status'),empty=document.getElementById('pc-search-empty');
 const branches=[...header.querySelectorAll('.pc-branch')],items=[...finder.querySelectorAll('[data-pc-page]')],groups=[...finder.querySelectorAll('.pc-group')];
 const mobile=matchMedia('(max-width:1170px)'),scrim=header.querySelector('.pc-backdrop');
 let drawer=false,returnTo=null,locked=null,inerted=[];
 const norm=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('id-ID');
 function lock(){
  if(locked)return;
  const props=['position','top','left','right','width','box-sizing'];
  locked={x:scrollX,y:scrollY,gutter:Math.max(0,innerWidth-document.documentElement.clientWidth),props:props.map(k=>[k,document.body.style.getPropertyValue(k),document.body.style.getPropertyPriority(k)]),overflow:document.documentElement.style.overflow,behavior:document.documentElement.style.scrollBehavior};
  document.body.style.boxSizing='border-box';document.body.style.position='fixed';document.body.style.top=-locked.y+'px';document.body.style.left='0';document.body.style.right='0';document.body.style.width=locked.gutter?'calc(100% - '+locked.gutter+'px)':'100%';document.documentElement.style.overflow='hidden';
 }
 function unlock(){
  if(!locked)return;const saved=locked;locked=null;
  for(const [key,value,priority]of saved.props){if(value)document.body.style.setProperty(key,value,priority);else document.body.style.removeProperty(key);}
  document.documentElement.style.overflow=saved.overflow;document.documentElement.style.scrollBehavior='auto';window.scrollTo(saved.x,saved.y);document.documentElement.style.scrollBehavior=saved.behavior;
 }
 function inertOutside(on){
  if(on){inerted=[...document.body.children].filter(el=>el!==header&&!['SCRIPT','STYLE','LINK'].includes(el.tagName)).map(el=>[el,el.inert]);inerted.forEach(([el])=>{el.inert=true;});}
  else{inerted.forEach(([el,value])=>{el.inert=value;});inerted=[];}
 }
 function closeBranches(except){branches.forEach(b=>{if(b!==except){b.open=false;b.querySelector('summary').setAttribute('aria-expanded','false');}});}
 function setDrawer(open,restore=true){
  if(open&&!mobile.matches)return;
  if(drawer===open){shell.open=!mobile.matches||open;return;}
  drawer=open;shell.open=!mobile.matches||open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Tutup menu':'Buka menu');scrim.hidden=!open;closeBranches();
  if(open){panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');lock();inertOutside(true);panel.querySelector('[data-pc-close]').focus({preventScroll:true});}
  else{panel.removeAttribute('role');panel.removeAttribute('aria-modal');inertOutside(false);if(!finder.open)unlock();if(restore&&mobile.matches)toggle.focus({preventScroll:true});}
 }
 function adapt(){const wasOpen=drawer;setDrawer(false,false);shell.open=!mobile.matches;closeBranches();if(wasOpen)(mobile.matches?toggle:header.querySelector('.pc-wordmark')).focus({preventScroll:true});}
 document.documentElement.classList.add('pc-ready');adapt();
 if(mobile.addEventListener)mobile.addEventListener('change',adapt);else mobile.addListener(adapt);
 toggle.addEventListener('click',()=>setDrawer(!drawer));
 header.querySelector('[data-pc-close]').addEventListener('click',()=>setDrawer(false));scrim.addEventListener('click',()=>setDrawer(false));
 header.addEventListener('focusout',()=>queueMicrotask(()=>{if(!mobile.matches&&!finder.open)branches.forEach(b=>{if(b.open&&!b.contains(document.activeElement)){b.open=false;b.querySelector('summary').setAttribute('aria-expanded','false');}});}));
 branches.forEach(branch=>{
  const summary=branch.querySelector('summary');summary.setAttribute('aria-expanded',String(branch.open));
  branch.addEventListener('toggle',()=>{summary.setAttribute('aria-expanded',String(branch.open));});
  summary.addEventListener('click',()=>{if(!branch.open)closeBranches(branch);});
 });
 function filter(){
  const terms=norm(search.value).trim().split(/\s+/).filter(Boolean);let count=0;
  const section=sectionFilter?.value||'';
  items.forEach(item=>{item.hidden=!!section&&item.closest('.pc-group')?.id!==section||!terms.every(term=>norm(item.dataset.pcPage+' '+item.textContent).includes(term));if(!item.hidden)count++;});
  groups.forEach(group=>{group.hidden=![...group.querySelectorAll('[data-pc-page]')].some(row=>!row.hidden);});
  status.textContent=count+' halaman'+(terms.length?' ditemukan':' tersedia')+(section?' di '+sectionFilter.selectedOptions[0].textContent:'')+'.';empty.hidden=count>0;
 }
 function openFinder(groupId,origin){
  const branch=origin?.closest('.pc-branch');returnTo=drawer?toggle:(branch?branch.querySelector('summary'):(origin||document.activeElement));setDrawer(false,false);closeBranches();
  search.value='';if(sectionFilter)sectionFilter.value=groups.some(g=>g.id===groupId)?groupId:'';filter();
  if(!finder.open){if(typeof finder.showModal==='function')finder.showModal();else{finder.setAttribute('open','');finder.setAttribute('role','dialog');finder.setAttribute('aria-modal','true');}}
  lock();finder.scrollTop=0;search.focus({preventScroll:true});
  
 }
 function closeFinder(){if(typeof finder.close==='function')finder.close();else finder.removeAttribute('open');finishFinder();}
 function finishFinder(){if(finder.open)return;if(!drawer)unlock();if(returnTo){const target=returnTo.isConnected&&returnTo.getClientRects().length?returnTo:(mobile.matches?toggle:header.querySelector('.pc-wordmark'));target.focus({preventScroll:true});returnTo=null;}}
 finder.addEventListener('close',finishFinder);finder.addEventListener('cancel',event=>{event.preventDefault();closeFinder();});
 finder.addEventListener('click',event=>{if(event.target===finder){const r=finder.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeFinder();}});
 finder.querySelector('[data-pc-search-close]').addEventListener('click',closeFinder);
 search.addEventListener('input',filter);sectionFilter?.addEventListener('change',filter);
 finder.querySelector('[data-pc-clear]').addEventListener('click',()=>{search.value='';if(sectionFilter)sectionFilter.value='';filter();search.focus();});
 document.querySelectorAll('a[data-pc-find]').forEach(a=>{a.setAttribute('aria-haspopup','dialog');a.setAttribute('aria-controls','pc-pages');});
 document.addEventListener('click',event=>{
  if(event.defaultPrevented)return;
  const find=event.target.closest('[data-pc-find]');
  if(find?.tagName==='A'&&(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey))return;
  if(find){event.preventDefault();openFinder(find.dataset.pcGroup,find);return;}
  const anchor=event.target.closest('a[href]');
  if(anchor){
   if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   let url;try{url=new URL(anchor.getAttribute('href'),location.href);}catch{return;}
   if(url.origin===location.origin&&url.pathname===location.pathname&&/^#(?:pc-pages|pc-search|pc-group-\d)$/.test(url.hash)){event.preventDefault();openFinder(url.hash.startsWith('#pc-group-')?url.hash.slice(1):null,anchor);return;}
   if(header.contains(anchor)){closeBranches();if(finder.open)closeFinder();if(drawer)setDrawer(false,false);}
   if(url.origin===location.origin&&url.pathname===location.pathname&&url.hash){
    let target;try{target=document.getElementById(decodeURIComponent(url.hash.slice(1)));}catch{return;}
    if(target){if(target.tagName==='DETAILS')target.open=true;let parent=target.parentElement;while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}}
   }
  }
  if(!header.contains(event.target))closeBranches();
 },true);
 const focusable=root=>[...root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex="0"]')].filter(el=>{if(!el.getClientRects().length||el.closest('[hidden],[inert]')||getComputedStyle(el).visibility==='hidden')return false;let p=el.parentElement;while(p&&p!==root){if(p.tagName==='DETAILS'&&!p.open&&!p.querySelector(':scope>summary')?.contains(el))return false;p=p.parentElement;}return true;});
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
   if(finder.open){event.preventDefault();closeFinder();return;}
   const opened=branches.find(b=>b.open);if(opened){event.preventDefault();closeBranches();opened.querySelector('summary').focus();return;}
   if(drawer){event.preventDefault();setDrawer(false);}return;
  }
  if(event.key==='Tab'&&(drawer||finder.open)){
   const root=finder.open?finder:panel,targets=focusable(root),first=targets[0],last=targets[targets.length-1];
   if(!first)return;
   if(event.shiftKey&&(document.activeElement===first||!root.contains(document.activeElement))){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&(document.activeElement===last||!root.contains(document.activeElement))){event.preventDefault();first.focus();}
  }
  if(event.key==='ArrowDown'&&event.target.matches('.pc-branch>summary')){event.preventDefault();const b=event.target.parentElement;closeBranches(b);b.open=true;b.querySelector('.pc-flyout a')?.focus();}
 });
 function revealHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}if(id==='pc-pages'||id==='pc-search'||/^pc-group-\d$/.test(id)){openFinder(id.startsWith('pc-group-')?id:null,toggle);return;}const target=document.getElementById(id);if(target){let p=target,opened=false;while(p){if(p.tagName==='DETAILS'&&!p.open){p.open=true;opened=true;}p=p.parentElement;}if(opened)requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'instant'}));}}
 addEventListener('hashchange',revealHash);addEventListener('pageshow',event=>{if(event.persisted){adapt();filter();if(finder.open)closeFinder();}});addEventListener('pagehide',()=>{setDrawer(false,false);if(finder.open)closeFinder();unlock();});
 filter();revealHash();
})();
