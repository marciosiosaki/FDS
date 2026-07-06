
(function(){
  var F = {};
  // state: { key: value | '' }  ; '' = sem filtro
  F.applyFilters = function(rows, state){
    return rows.filter(function(x){
      for(var k in state){
        var v = state[k]; if(v===''||v==null) continue;
        if(Array.isArray(v)){ if(v.length && v.indexOf(x[k]==null?null:x[k])<0) return false; continue; }
        if(k==='mes'){ if((x.mes||'')!==v) return false; }
        else if((x[k]==null?'':String(x[k]))!==String(v)) return false;
      }
      return true;
    });
  };
  // defs: [{key,label,valueFn?,options?,allLabel?,multi?}]  multi=true -> seleção múltipla
  F.mount = function(container, defs, baseRows, onChange){
    var el = (typeof container==='string')? document.getElementById(container): container;
    el.innerHTML=''; var state={};
    defs.forEach(function(d){
      var opts = d.options || Array.from(new Set(baseRows.map(function(r){ return d.valueFn? d.valueFn(r): r[d.key]; })
                   .filter(function(v){return v!=null && v!=='';}))).sort(d.sort||undefined);
      var wrap=document.createElement('div'); wrap.className='fld';
      var lab=document.createElement('label'); lab.textContent=d.label; wrap.appendChild(lab);

      if(d.multi){
        state[d.key]=[];
        var box=document.createElement('div'); box.className='ms';
        var btn=document.createElement('button'); btn.type='button'; btn.className='fds-filter ms-btn';
        btn.textContent=d.allLabel||'(Todos)';
        var panel=document.createElement('div'); panel.className='ms-panel ms-hidden';
        opts.forEach(function(o){
          var val=(typeof o==='object')?o.value:o, txt=(typeof o==='object')?o.label:o;
          var l=document.createElement('label'); var cb=document.createElement('input'); cb.type='checkbox'; cb.value=val;
          cb.addEventListener('change', function(){
            var arr=state[d.key];
            if(cb.checked){ if(arr.indexOf(val)<0) arr.push(val); } else { var i=arr.indexOf(val); if(i>=0) arr.splice(i,1); }
            btn.textContent = arr.length===0 ? (d.allLabel||'(Todos)') : (arr.length===1 ? String(arr[0]) : (arr.length+' selecionados'));
            onChange(F.applyFilters(baseRows,state), state);
          });
          l.appendChild(cb); l.appendChild(document.createTextNode(' '+txt)); panel.appendChild(l);
        });
        btn.addEventListener('click', function(e){ e.stopPropagation(); panel.classList.toggle('ms-hidden'); });
        panel.addEventListener('click', function(e){ e.stopPropagation(); });
        document.addEventListener('click', function(){ panel.classList.add('ms-hidden'); });
        box.appendChild(btn); box.appendChild(panel); wrap.appendChild(box);
      } else {
        state[d.key]='';
        var sel=document.createElement('select'); sel.className='fds-filter';
        var all=document.createElement('option'); all.value=''; all.textContent=d.allLabel||'(Todos)'; sel.appendChild(all);
        opts.forEach(function(o){ var op=document.createElement('option');
          if(typeof o==='object'){ op.value=o.value; op.textContent=o.label; } else { op.value=o; op.textContent=o; }
          sel.appendChild(op); });
        sel.addEventListener('change', function(){ state[d.key]=sel.value; onChange(F.applyFilters(baseRows,state), state); });
        wrap.appendChild(sel);
      }
      el.appendChild(wrap);
    });
    return state;
  };
  // opções de mês: [{value:'YYYY-MM', label:'mmm/aaaa'}] ordenadas
  F.monthOptions = function(rows){
    var s=new Set(); rows.forEach(function(r){ if(r.mes!=null) s.add(r.mes); });
    return Array.from(s).sort().map(function(k){
      var mm=parseInt(k.slice(5,7),10), yy=k.slice(0,4);
      return {value:k, label:window.MESES[mm-1]+"/"+yy};
    });
  };
  window.FDSFilters = F;
})();
