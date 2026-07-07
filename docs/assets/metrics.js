
(function(){
  function sum(rows,f){ var t=0; for(var i=0;i<rows.length;i++) t+=(f(rows[i])||0); return t; }
  function distinctCount(rows,key){ var s=new Set(); for(var i=0;i<rows.length;i++){var v=rows[i][key]; if(v!=null) s.add(v);} return s.size; }
  function countWhere(rows,pred){ var n=0; for(var i=0;i<rows.length;i++) if(pred(rows[i])) n++; return n; }

  var M = {};
  M.consultas = function(r){ return sum(r,function(x){return x.consultas;}); };
  M.linhas = function(r){ return r.length; };
  M.medicosDistintos = function(r){ return distinctCount(r,'cd_medico'); };
  M.unidadesDistintas = function(r){ return distinctCount(r,'cd_unidade'); };
  M.especialidadesDistintas = function(r){ return distinctCount(r,'cd_esp'); };
  M.consultasPorMedico = function(r){ var md=M.medicosDistintos(r); return md? M.consultas(r)/md : 0; };
  M.pctAceitou = function(r){ var n=r.length; return n? countWhere(r,function(x){return x.aceitou==='SIM';})/n : 0; };
  M.pctRecorrente = function(r){ var n=r.length; return n? countWhere(r,function(x){return x.recorrente==='SIM';})/n : 0; };

  function medWhere(r,pred){ var s=new Set(); for(var i=0;i<r.length;i++){ if(pred(r[i]) && r[i].cd_medico!=null) s.add(r[i].cd_medico);} return s.size; }
  M.medicosNaoAbordados = function(r){ return medWhere(r,function(x){return x.aceitou==='NÃO ABORDADO';}); };
  M.medicosNaoAceitaram = function(r){ return medWhere(r,function(x){return x.aceitou==='NÃO';}); };
  M.medicosAcionaveis = function(r){ return medWhere(r,function(x){return x.aceitou!=='SIM';}); };
  M.linhasSemMov = function(r){ return countWhere(r,function(x){return x.mes==null;}); };
  M.consultasEmRisco = function(r){ return sum(r,function(x){ return (x.aceitou==='NÃO'||x.aceitou==='NÃO ABORDADO')? x.consultas:0; }); };

  function pending(x){ return (x.acao==null) || (x.acao.toString().trim()===''); }
  M.linhasPendentesAcao = function(r){ return countWhere(r,pending); };
  M.pctAcaoPendente = function(r){ var n=r.length; return n? M.linhasPendentesAcao(r)/n : 0; };
  M.pctAcaoDefinida = function(r){ var n=r.length; return n? countWhere(r,function(x){return !pending(x);})/n : 0; };
  M.consultasEmRiscoPendentes = function(r){ return sum(r,function(x){ return ((x.aceitou==='NÃO'||x.aceitou==='NÃO ABORDADO')&&pending(x))? x.consultas:0; }); };

  M.baseCredenciamento = function(r){ return r.filter(function(x){ return x.recorrente==='SIM' && x.aceitou!=='SIM'; }); };

  M.serieMensal = function(r){
    var map={};
    r.forEach(function(x){ if(x.mes!=null){ map[x.mes]=(map[x.mes]||0)+(x.consultas||0); } });
    var keys=Object.keys(map).sort();
    var out=[], prev=null;
    keys.forEach(function(k){
      var val=map[k], mm=parseInt(k.slice(5,7),10), yy=k.slice(0,4);
      var v=(prev!=null && prev!==0)? (val-prev)/prev : null;
      out.push({mes:k, label:window.MESES[mm-1]+"/"+yy, consultas:val, var_pct:v});
      prev=val;
    });
    return out;
  };

  M.ufAgg = function(r){
    var acc={};
    r.forEach(function(x){
      if(x.lat==null||x.lon==null||x.uf==null) return;
      var a=acc[x.uf]||(acc[x.uf]={slat:0,slon:0,n:0,consultas:0});
      a.slat+=x.lat; a.slon+=x.lon; a.n+=1; a.consultas+=(x.consultas||0);
    });
    var out={};
    Object.keys(acc).forEach(function(uf){ var a=acc[uf]; out[uf]={lat:a.slat/a.n, lon:a.slon/a.n, consultas:a.consultas}; });
    return out;
  };

  M.groupSum = function(r,key,valFn){ var map={}; r.forEach(function(x){ var k=(x[key]==null?'—':x[key]); map[k]=(map[k]||0)+(valFn?valFn(x):1); }); return map; };
  M.distinctVals = function(r,key){ var s=new Set(); r.forEach(function(x){ if(x[key]!=null && x[key]!=='') s.add(x[key]); }); return Array.from(s); };

  // prontidão de fechamento por unidade (regra §3.6, redefinida 2026-07-07): 1 objeto por
  // CD_UNIDADE, agregando SOBRE as linhas já filtradas -> só entram unidades presentes no
  // recorte (evita o bug do Power BI de listar toda unidade como "OK" fora do filtro).
  // Só linhas RECORRENTES contam; resolvida = SIM, ou NÃO com ação real (≠ Prospectar/
  // Pendente/vazia), ou PA/Não abordado com ação 'Sem Ação'. O resto bloqueia.
  M.unidadesProntidao = function(r){
    var by = {};
    for(var i=0;i<r.length;i++){
      var x=r[i], u=x.cd_unidade; if(u==null) continue;
      var o = by[u] || (by[u] = {cd_unidade:u, clinica:x.clinica, uf:x.uf, empresa:x.empresa,
                                 diretor:x.diretor, linhas:0, linhas_bloqueio:0, consultas_bloqueio:0});
      o.linhas += 1;
      var rec = (x.recorrente==='SIM');
      var st = x.aceitou;
      var k = (x.acao==null) ? '' : x.acao.toString().replace(/\s+/g,' ').trim().toUpperCase();
      var acaoReal = (k!=='' && k!=='PROSPECTAR' && k.indexOf('PENDENTE')<0);
      var resolvida = (st==='SIM')
                   || (st==='NÃO' && acaoReal)
                   || (st!=='SIM' && st!=='NÃO' && k==='SEM AÇÃO');
      var bloq = rec && !resolvida;
      if(bloq){ o.linhas_bloqueio += 1; o.consultas_bloqueio += (x.consultas||0); }
    }
    return Object.keys(by).map(function(k){ var o=by[k];
      o.status = o.linhas_bloqueio>0 ? 'Pendente' : 'OK'; return o; });
  };

  window.FDSM = M;
})();
