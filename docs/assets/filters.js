
(function(){
  var F = {};
  // state: { key: value | '' }  ; '' = sem filtro
  F.applyFilters = function(rows, state){
    return rows.filter(function(x){
      for(var k in state){
        var v = state[k]; if(v===''||v==null) continue;
        if(k==='mes'){ if((x.mes||'')!==v) return false; }
        else if((x[k]==null?'':String(x[k]))!==String(v)) return false;
      }
      return true;
    });
  };
  // defs: [{key,label,valueFn?,options?,allLabel?}]
  F.mount = function(container, defs, baseRows, onChange){
    var el = (typeof container==='string')? document.getElementById(container): container;
    el.innerHTML=''; var state={};
    defs.forEach(function(d){
      state[d.key]='';
      var wrap=document.createElement('div'); wrap.className='fld';
      var lab=document.createElement('label'); lab.textContent=d.label; wrap.appendChild(lab);
      var sel=document.createElement('select'); sel.className='fds-filter';
      var opts = d.options || Array.from(new Set(baseRows.map(function(r){ return d.valueFn? d.valueFn(r): r[d.key]; })
                   .filter(function(v){return v!=null && v!=='';}))).sort(d.sort||undefined);
      var all=document.createElement('option'); all.value=''; all.textContent=d.allLabel||'(Todos)'; sel.appendChild(all);
      opts.forEach(function(o){ var op=document.createElement('option');
        if(typeof o==='object'){ op.value=o.value; op.textContent=o.label; } else { op.value=o; op.textContent=o; }
        sel.appendChild(op); });
      sel.addEventListener('change', function(){ state[d.key]=sel.value; onChange(F.applyFilters(baseRows,state), state); });
      wrap.appendChild(sel); el.appendChild(wrap);
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
