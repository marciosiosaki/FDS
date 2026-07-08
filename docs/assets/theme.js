
window.FDS_THEME = {
  wine:"#6E323E", wineDark:"#3C1C26", card:"#FFFFFF", border:"#EDEBF0", cardAlt:"#F7F5F8",
  ink:"#1C1820", ink2:"#5A505C", orange:"#E08438",
  purple:"#8A5CC7", purpleDeep:"#5D3B96", lavender:"#CBA7EA", teal:"#2EB7A1",
  blue:"#2563EB", green:"#34C759", red:"#EB5757", amber:"#FFAF32", pleito:"#FFC24B", slate:"#94A3B8",
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

// Cores por AÇÃO — cada categoria com cor distinta. Fixadas: Sem Ação=verde,
// Prospectar=vermelho, Clínicas - Pendente=cinza claro. Vocabulário pode crescer:
// valores não catalogados recebem cor estável distinta via hash de um palette extra.
var _ACAO = {
  "SEM AÇÃO":"#34C759",                                   // verde (fixado)
  "PROSPECTAR":"#EB5757",                                  // vermelho (fixado)
  "CLINICAS - PENDENTE":"#CBD5E1",                         // cinza claro (fixado)
  "MANTER PA ABERTO":"#FFC24B",                            // âmbar
  "CONFIRMAR SE HAVERÁ FECHAMENTO UNIDADE WEG":"#F2994A",  // laranja
  "PENDENTE":"#2563EB",                                    // azul
  "MANTER ATT EM HOSPITAL CASA FORTE":"#2EB7A1"            // teal
};
window.ACAO_BLANK = "#8A5CC7";                             // (Em branco) / pendente (roxo)
var _ACAO_EXTRA = ["#DB2777","#5D3B96","#0EA5E9","#84CC16","#A855F7","#F59E0B","#14B8A6","#6366F1"];
function _hash(s){ var h=0; for(var i=0;i<s.length;i++){ h=(h*31+s.charCodeAt(i))|0; } return Math.abs(h); }
// a = texto cru da ação (ou null/vazio = pendente). '(Em branco)' também é pendente.
window.acaoColor = function(a){
  if(a==null) return window.ACAO_BLANK;
  var k = a.toString().replace(/\s+/g,' ').trim().toUpperCase();
  if(k==='' || k==='(EM BRANCO)') return window.ACAO_BLANK;
  return _ACAO[k] || _ACAO_EXTRA[_hash(k) % _ACAO_EXTRA.length];
};
window.acaoLabel = function(a){
  if(a==null || a.toString().trim()==='') return '(Em branco)';
  return a.toString().trim();
};
// escape p/ texto livre inserido via innerHTML (tabelas / matriz / links)
window.escapeHtml = function(s){
  return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
};
// cor de texto (preto/branco) conforme luminância do fundo — legibilidade dos rótulos
function _lum(hex){ var c=hex.replace('#',''); if(c.length===3){c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];}
  var r=parseInt(c.substr(0,2),16),g=parseInt(c.substr(2,2),16),b=parseInt(c.substr(4,2),16);
  return (0.299*r+0.587*g+0.114*b)/255; }
window.textColorFor = function(hex){ return _lum(hex)>0.62 ? '#1C1820' : '#FFFFFF'; };
