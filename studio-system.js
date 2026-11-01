/* Small progressive enhancements. No network calls, analytics or remote dependencies. */
(()=>{'use strict';
 const header=document.getElementById('pc-header');if(!header)return;
 document.addEventListener('keydown',event=>{
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
   if(event.target.closest('input,textarea,[contenteditable=true]')&&!document.getElementById('pc-pages')?.open)return;
   event.preventDefault();header.querySelector('.pc-search-trigger')?.click();
  }
 });
 // The old feature openers are now reachable in the primary header. Modal state
 // belongs to the original feature implementation, which preserves its data model.
 // Focus return is added only for those original local dialogs.
 document.addEventListener('click',event=>{
  if(!event.target.closest('#bag-open,#saved-open'))return;
  const toggle=document.getElementById('pc-menu-toggle');
  if(toggle?.getAttribute('aria-expanded')==='true')header.querySelector('[data-pc-close]')?.click();
 },true);
 for(const [triggerId,dialogId] of [['bag-open','bag'],['saved-open','saved']]){
  const trigger=document.getElementById(triggerId),dialog=document.getElementById(dialogId);
  if(!trigger||!dialog)continue;
  dialog.addEventListener('close',()=>{const target=trigger.getClientRects().length?trigger:document.getElementById('pc-menu-toggle');target?.focus({preventScroll:true});});
 }
 // Make section headings focusable when a native table-of-contents link is used.
 document.querySelectorAll('.pf-contents a[href^="#"]').forEach(link=>link.addEventListener('click',()=>{
  let id;try{id=decodeURIComponent(link.hash.slice(1));}catch{return;}
  const heading=document.getElementById(id);if(!heading)return;
  if(!heading.hasAttribute('tabindex'))heading.setAttribute('tabindex','-1');
  heading.focus({preventScroll:true});
 }));
})();
