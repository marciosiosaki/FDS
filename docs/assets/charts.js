
(function(){
  var T = window.FDS_THEME;
  var BASE_LAYOUT = { font:{family:'Montserrat, sans-serif', color:T.ink, size:12},
    paper_bgcolor:'#fff', plot_bgcolor:'#fff', separators:',.',
    margin:{l:48,r:16,t:14,b:40}, colorway:T.dataColors, showlegend:false };
  var CFG = {displayModeBar:false, responsive:true};
  function layout(extra){ return Object.assign({}, BASE_LAYOUT, extra||{}); }
  function el(id){ return (typeof id==='string')? document.getElementById(id): id; }

  var C = {};

  // combo: colunas consultas por mês + linha variação % (yaxis2)
  C.combo = function(id, rows){
    var s = FDSM.serieMensal(rows);
    var x = s.map(function(d){return d.label;});
    var bar = {type:'bar', x:x, y:s.map(function(d){return d.consultas;}), name:'Consultas',
      marker:{color:T.purple}, hovertemplate:'%{x}<br>%{y:,} consultas<extra></extra>'};
    var line = {type:'scatter', mode:'lines+markers', x:x, yaxis:'y2', name:'Var % MoM',
      y:s.map(function(d){return d.var_pct==null?null:d.var_pct*100;}), connectgaps:false,
      line:{color:T.orange, width:3}, marker:{size:7,color:T.orange},
      hovertemplate:'%{x}<br>%{y:.1f}%<extra></extra>'};
    Plotly.react(el(id), [bar,line], layout({
      xaxis:{tickangle:0}, yaxis:{title:'', gridcolor:T.border},
      yaxis2:{overlaying:'y', side:'right', ticksuffix:'%', showgrid:false, zeroline:true},
      showlegend:true, legend:{orientation:'h', y:1.14, x:0}, margin:{l:52,r:52,t:26,b:40}}), CFG);
  };

  C.donutStatus = function(id, rows){
    var order = window.STATUS_ORDER, cnt={};
    rows.forEach(function(r){ cnt[r.aceitou]=(cnt[r.aceitou]||0)+1; });
    var labels=[], values=[], colors=[];
    order.forEach(function(s){ if(cnt[s]){ labels.push(s); values.push(cnt[s]); colors.push(statusColor(s)); } });
    Plotly.react(el(id), [{type:'pie', hole:.62, labels:labels, values:values, sort:false,
      marker:{colors:colors}, textinfo:'percent', texttemplate:'%{percent:.0%}',
      hovertemplate:'%{label}<br>%{value:,} linhas (%{percent})<extra></extra>'}],
      layout({showlegend:true, legend:{orientation:'h', y:-0.08}, margin:{l:8,r:8,t:8,b:20}}), CFG);
  };

  C.barByDirector = function(id, rows){
    var m = FDSM.groupSum(rows,'diretor',function(r){return r.consultas;});
    var arr = Object.keys(m).map(function(k){return [k,m[k]];}).sort(function(a,b){return a[1]-b[1];});
    Plotly.react(el(id), [{type:'bar', orientation:'h',
      y:arr.map(function(a){return a[0];}), x:arr.map(function(a){return a[1];}),
      marker:{color:T.purple}, text:arr.map(function(a){return fmtInt(a[1]);}), textposition:'auto',
      hovertemplate:'%{y}<br>%{x:,} consultas<extra></extra>'}],
      layout({xaxis:{gridcolor:T.border}, yaxis:{automargin:true}, margin:{l:8,r:16,t:10,b:36}}), CFG);
  };

  C.brazilMap = function(id, rows){
    var agg = FDSM.ufAgg(rows);
    var ufs=Object.keys(agg), lat=[],lon=[],size=[],text=[];
    var maxC=1; ufs.forEach(function(u){ if(agg[u].consultas>maxC) maxC=agg[u].consultas; });
    ufs.forEach(function(u){ var a=agg[u]; lat.push(a.lat); lon.push(a.lon);
      size.push(Math.max(a.consultas,1)); text.push('<b>'+u+'</b><br>'+fmtInt(a.consultas)+' consultas'); });
    var sizeref = 2.0*maxC/(46*46);
    Plotly.react(el(id), [{type:'scattergeo', lat:lat, lon:lon, text:text, hoverinfo:'text',
      marker:{size:size, sizemode:'area', sizeref:sizeref, sizemin:6, color:T.orange,
        opacity:.82, line:{color:'#fff',width:1}}}],
      layout({ geo:{scope:'south america', resolution:50, showcountries:true, countrycolor:T.border,
        showland:true, landcolor:'#F3EEF5', showframe:false, bgcolor:'rgba(0,0,0,0)',
        lataxis:{range:[-34,6]}, lonaxis:{range:[-75,-32]}, center:{lat:-14,lon:-53}},
        margin:{l:0,r:0,t:0,b:0}}), CFG);
  };

  // scatter clínicas: x=Médicos, y=% Aceitou, size=Consultas
  C.scatterClinic = function(id, rows){
    var by={}; rows.forEach(function(r){ var k=r.clinica||'—'; (by[k]||(by[k]=[])).push(r); });
    var x=[],y=[],sz=[],tx=[]; var maxC=1;
    Object.keys(by).forEach(function(k){ var g=by[k]; var c=FDSM.consultas(g); if(c>maxC)maxC=c;
      x.push(FDSM.medicosDistintos(g)); y.push(FDSM.pctAceitou(g)*100); sz.push(Math.max(c,1));
      tx.push('<b>'+k+'</b><br>Médicos: '+FDSM.medicosDistintos(g)+'<br>% Aceitou: '+fmtPct(FDSM.pctAceitou(g))+'<br>'+fmtInt(c)+' consultas'); });
    var sizeref=2.0*maxC/(40*40);
    Plotly.react(el(id), [{type:'scatter', mode:'markers', x:x, y:y, text:tx, hoverinfo:'text',
      marker:{size:sz, sizemode:'area', sizeref:sizeref, sizemin:5, color:T.teal, opacity:.7, line:{color:'#fff',width:1}}}],
      layout({xaxis:{title:'Médicos', gridcolor:T.border}, yaxis:{title:'% Aceitou', ticksuffix:'%', gridcolor:T.border},
        margin:{l:52,r:16,t:12,b:44}}), CFG);
  };

  C.barPctByClinic = function(id, rows){
    var by={}; rows.forEach(function(r){ var k=r.clinica||'—'; (by[k]||(by[k]=[])).push(r); });
    var arr=Object.keys(by).map(function(k){ return [k, FDSM.pctAceitou(by[k])]; })
              .sort(function(a,b){return a[1]-b[1];});
    Plotly.react(el(id), [{type:'bar', orientation:'h', y:arr.map(function(a){return a[0];}),
      x:arr.map(function(a){return a[1]*100;}), marker:{color:T.purpleDeep},
      text:arr.map(function(a){return fmtPct(a[1]);}), textposition:'auto',
      hovertemplate:'%{y}<br>%{x:.1f}%<extra></extra>'}],
      layout({xaxis:{ticksuffix:'%', gridcolor:T.border, range:[0,100]}, yaxis:{automargin:true}, margin:{l:8,r:16,t:8,b:36}}), CFG);
  };

  C.colBySpecialty = function(id, rows){
    var m=FDSM.groupSum(rows,'especialidade',function(r){return r.consultas;});
    var arr=Object.keys(m).map(function(k){return [k,m[k]];}).sort(function(a,b){return b[1]-a[1];});
    Plotly.react(el(id), [{type:'bar', x:arr.map(function(a){return a[0];}), y:arr.map(function(a){return a[1];}),
      marker:{color:T.purple}, hovertemplate:'%{x}<br>%{y:,} consultas<extra></extra>'}],
      layout({xaxis:{tickangle:-35, automargin:true}, yaxis:{gridcolor:T.border}, margin:{l:52,r:12,t:10,b:90}}), CFG);
  };

  C.barRiskByAcao = function(id, rows){
    var risk = rows.filter(function(r){ return r.aceitou==='NÃO'||r.aceitou==='NÃO ABORDADO'; });
    var by={}; risk.forEach(function(r){ var k=acaoLabel(r.acao); by[k]=(by[k]||0)+(r.consultas||0); });
    var arr=Object.keys(by).map(function(k){return [k,by[k]];}).sort(function(a,b){return a[1]-b[1];});
    Plotly.react(el(id), [{type:'bar', orientation:'h', y:arr.map(function(a){return a[0];}),
      x:arr.map(function(a){return a[1];}),
      marker:{color:arr.map(function(a){return acaoColor(a[0]==='(Em branco)'?null:a[0]);})},
      text:arr.map(function(a){return fmtInt(a[1]);}), textposition:'auto',
      hovertemplate:'%{y}<br>%{x:,} consultas em risco<extra></extra>'}],
      layout({xaxis:{gridcolor:T.border}, yaxis:{automargin:true}, margin:{l:8,r:16,t:8,b:36}}), CFG);
  };

  // barras 100% empilhadas com RÓTULO ABSOLUTO em cada segmento
  C.stacked100 = function(id, rows, groupKey, catFn, colorFn, catOrder){
    var groups = Array.from(new Set(rows.map(function(r){return r[groupKey];}).filter(function(v){return v!=null;}))).sort();
    var cats = catOrder ? catOrder.slice() : Array.from(new Set(rows.map(catFn)));
    var cnt={}; groups.forEach(function(g){ cnt[g]={}; });
    rows.forEach(function(r){ var g=r[groupKey]; if(g==null) return; var c=catFn(r); if(!(g in cnt)) cnt[g]={}; cnt[g][c]=(cnt[g][c]||0)+1; });
    if(catOrder){ rows.forEach(function(r){ var c=catFn(r); if(cats.indexOf(c)<0) cats.push(c); }); }
    var traces = cats.map(function(c){
      var yv = groups.map(function(g){ return (cnt[g][c]||0); });
      return {type:'bar', name:c, y:groups, x:yv, orientation:'h',
        marker:{color:colorFn(c)},
        text:yv.map(function(v){ return v>0? fmtInt(v): ''; }), texttemplate:'%{text}',
        textposition:'inside', insidetextanchor:'middle', textfont:{color:'#fff', size:11},
        hovertemplate:'%{y} · '+c+'<br>%{x} linhas<extra></extra>'};
    });
    Plotly.react(el(id), traces, layout({ barmode:'stack', barnorm:'percent',
      xaxis:{ticksuffix:'%', range:[0,100], gridcolor:T.border}, yaxis:{automargin:true},
      showlegend:true, legend:{orientation:'h', y:1.08, x:0, font:{size:11}}, margin:{l:8,r:14,t:30,b:36}}), CFG);
  };

  C.gauge = function(id, pct, title){
    Plotly.react(el(id), [{type:'indicator', mode:'gauge+number', value:(pct||0)*100,
      number:{suffix:'%', valueformat:'.1f', font:{size:30, color:T.ink}},
      title:{text:title, font:{size:14, color:T.ink}},
      gauge:{axis:{range:[0,100], visible:false},
        bar:{color:T.purple, thickness:.72}, bgcolor:T.cardAlt, borderwidth:0,
        threshold:{line:{color:T.red, width:4}, thickness:.95, value:100}}}],
      layout({separators:',.', margin:{l:20,r:20,t:44,b:8}}), CFG);
  };

  C.colByMonth = function(id, rows){
    var s=FDSM.serieMensal(rows);
    Plotly.react(el(id), [{type:'bar', x:s.map(function(d){return d.label;}), y:s.map(function(d){return d.consultas;}),
      marker:{color:T.purple}, hovertemplate:'%{x}<br>%{y:,} consultas<extra></extra>'}],
      layout({xaxis:{automargin:true}, yaxis:{gridcolor:T.border}, margin:{l:48,r:12,t:10,b:40}}), CFG);
  };

  // ---- MATRIZ Diretor > Gerente (HTML) ----
  C.matrixDirGer = function(id, rows){
    var node=el(id);
    var byDir={}; rows.forEach(function(r){ var d=r.diretor||'—'; (byDir[d]||(byDir[d]={rows:[],ger:{}}));
      byDir[d].rows.push(r); var g=r.gerente||'—'; (byDir[d].ger[g]||(byDir[d].ger[g]=[])).push(r); });
    function cells(g){ return '<td class="num">'+fmtInt(FDSM.consultas(g))+'</td>'+
      '<td class="num">'+fmtInt(FDSM.medicosDistintos(g))+'</td>'+
      '<td class="num">'+fmtPct(FDSM.pctAceitou(g))+'</td>'+
      '<td class="num">'+fmtPct(FDSM.pctRecorrente(g))+'</td>'; }
    var html='<table class="matrix"><thead><tr><th>Diretor / Gerente</th><th>Consultas</th><th>Médicos</th><th>% Aceitou</th><th>% Recorrente</th></tr></thead><tbody>';
    Object.keys(byDir).sort().forEach(function(d){
      html+='<tr class="dir-row"><td>'+d+'</td>'+cells(byDir[d].rows)+'</tr>';
      Object.keys(byDir[d].ger).sort().forEach(function(g){
        html+='<tr class="ger-row"><td>'+g+'</td>'+cells(byDir[d].ger[g])+'</tr>'; });
    });
    html+='</tbody></table>';
    node.innerHTML=html;
  };

  // ---- TABELA detalhada (busca + paginação) ----
  C.tableDetail = function(id, rows, columns, opts){
    opts=opts||{}; var node=el(id); var pageSize=opts.pageSize||20; var page=1; var q='';
    var searchable = opts.searchKeys || null;
    function filtered(){
      if(!q) return rows;
      var s=q.toLowerCase();
      return rows.filter(function(r){
        var keys = searchable || Object.keys(r);
        for(var i=0;i<keys.length;i++){ var v=r[keys[i]]; if(v!=null && String(v).toLowerCase().indexOf(s)>=0) return true; }
        return false;
      });
    }
    function render(){
      var data=filtered(); var pages=Math.max(1,Math.ceil(data.length/pageSize));
      if(page>pages) page=pages;
      var slice=data.slice((page-1)*pageSize, page*pageSize);
      var h='<div class="table-tools"><input class="tbl-search" placeholder="Buscar…" value="'+q.replace(/"/g,'&quot;')+'"><span class="muted">'+fmtInt(data.length)+' linhas</span></div>';
      h+='<div class="tbl-scroll"><table class="fds-table"><thead><tr>';
      columns.forEach(function(c){ h+='<th'+(c.num?' style="text-align:right"':'')+'>'+c.title+'</th>'; });
      h+='</tr></thead><tbody>';
      slice.forEach(function(r){ h+='<tr>'; columns.forEach(function(c){ h+='<td class="'+(c.num?'num':'')+(c.cls?(' '+c.cls):'')+'">'+(c.get(r)==null?'':c.get(r))+'</td>'; }); h+='</tr>'; });
      h+='</tbody></table></div>';
      h+='<div class="pager"><button '+(page<=1?'disabled':'')+' data-a="prev">‹ Anterior</button><span>Página '+page+' de '+pages+'</span><button '+(page>=pages?'disabled':'')+' data-a="next">Próxima ›</button></div>';
      node.innerHTML=h;
      var inp=node.querySelector('.tbl-search');
      inp.addEventListener('input', function(){ q=inp.value; page=1; render(); setTimeout(function(){var i=node.querySelector('.tbl-search'); i.focus(); i.setSelectionRange(i.value.length,i.value.length);},0); });
      node.querySelectorAll('.pager button').forEach(function(b){ b.addEventListener('click', function(){ page += (b.getAttribute('data-a')==='next'?1:-1); render(); }); });
    }
    render();
  };

  window.FDSC = C;
})();
