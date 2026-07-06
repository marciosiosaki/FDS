
window.FDS_THEME = {
  wine:"#6E323E", wineDark:"#3C1C26", card:"#FFFFFF", border:"#EDEBF0", cardAlt:"#F7F5F8",
  ink:"#1C1820", ink2:"#5A505C", orange:"#E08438",
  purple:"#8A5CC7", purpleDeep:"#5D3B96", lavender:"#CBA7EA", teal:"#2EB7A1",
  blue:"#2563EB", green:"#34C759", red:"#EB5757", amber:"#FFAF32", slate:"#94A3B8",
  dataColors:["#8A5CC7","#2EB7A1","#5D3B96","#CBA7EA","#E08438","#2563EB","#DB2777","#94A3B8","#34C759","#EB5757"]
};
window.MESES = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

var _nf0 = new Intl.NumberFormat('pt-BR');
window.fmtInt = function(n){ return _nf0.format(Math.round(+n||0)); };
window.fmtDec = function(n,d){ return new Intl.NumberFormat('pt-BR',{minimumFractionDigits:(d==null?1:d),maximumFractionDigits:(d==null?1:d)}).format(+n||0); };
window.fmtPct = function(x,d){ d=(d==null?1:d);
  return new Intl.NumberFormat('pt-BR',{style:'percent',minimumFractionDigits:d,maximumFractionDigits:d}).format(+x||0); };

var _STATUS = {"SIM":"#34C759","PA":"#2563EB","NÃO ABORDADO":"#FFAF32","NÃO":"#EB5757"};
window.statusColor = function(s){ return _STATUS[(s||'').toString().trim().toUpperCase()] || "#94A3B8"; };
window.STATUS_ORDER = ["SIM","PA","NÃO ABORDADO","NÃO"];

var _ACAO = {
  "PROSPECTAR":"#EB5757",
  "CONFIRMAR SE HAVERÁ FECHAMENTO UNIDADE WEG":"#F2994A",
  "MANTER PA ABERTO":"#FFC24B",
  "SEM AÇÃO":"#34C759"
};
window.ACAO_BLANK = "#8A5CC7";
window.ACAO_FALLBACK = "#94A3B8";
// a = texto cru da ação (ou null/vazio = pendente). '(Em branco)' também é pendente.
window.acaoColor = function(a){
  if(a==null) return window.ACAO_BLANK;
  var k = a.toString().replace(/\s+/g,' ').trim().toUpperCase();
  if(k==='' || k==='(EM BRANCO)') return window.ACAO_BLANK;
  return _ACAO[k] || window.ACAO_FALLBACK;
};
window.acaoLabel = function(a){
  if(a==null || a.toString().trim()==='') return '(Em branco)';
  return a.toString().trim();
};
