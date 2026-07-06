
(function(){
  var USER="ADMIN", PASS="16121980";
  var A = {};
  A.guard = function(){
    if(sessionStorage.getItem('fds_auth')==='1') return true;
    var ov=document.createElement('div'); ov.className='login-ov';
    ov.innerHTML =
      '<div class="login-card">'+
        '<div class="lg-eyebrow">MDS · CREDENCIAMENTO · FDS</div>'+
        '<h2>Acesso restrito</h2>'+
        '<p class="lg-sub">Movimentação de Agendas — Finais de Semana</p>'+
        '<label>Usuário</label><input id="lg-user" autocomplete="off" autofocus>'+
        '<label>Senha</label><input id="lg-pass" type="password" autocomplete="off">'+
        '<button id="lg-btn">Entrar</button>'+
        '<div class="login-err" id="lg-err"></div>'+
        '<div class="login-foot"><i></i><i></i><i></i></div>'+
      '</div>';
    document.body.appendChild(ov);
    function tryLogin(){
      var u=document.getElementById('lg-user').value.trim();
      var p=document.getElementById('lg-pass').value;
      if(u.toUpperCase()===USER && p===PASS){ sessionStorage.setItem('fds_auth','1'); location.reload(); }
      else { document.getElementById('lg-err').textContent='Usuário ou senha inválidos.'; }
    }
    document.getElementById('lg-btn').addEventListener('click', tryLogin);
    ov.addEventListener('keydown', function(e){ if(e.key==='Enter') tryLogin(); });
    return false;
  };
  A.logout = function(){ sessionStorage.removeItem('fds_auth'); location.reload(); };
  window.FDSAuth = A;
})();
