/* =========================================================
   Pão Fraterno — Login (admin.html)
   Autentica (mock) e redireciona para o painel protegido.

   Observações:
   - Não há backend. O login é apenas simulação de interface
     (admin / admin).
   - A sessão vive em sessionStorage; se indisponível (file://,
     modo privado), usamos uma variável de módulo como reserva,
     e ainda assim seguimos para o painel.
   ========================================================= */

(function () {
  'use strict';

  const USUARIO_MOCK = 'admin';
  const SENHA_MOCK = 'admin';

  function initLogin() {
    const form = document.getElementById('form-login');
    const erro = document.getElementById('login-erro');
    if (!form) return;

    // Se já estiver logado, vai direto ao painel.
    if (PaoFraternoAuth.estaLogado()) {
      window.location.replace('painel.html');
      return;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const usuario = document.getElementById('login-usuario').value.trim();
      const senha = document.getElementById('login-senha').value;

      if (usuario === USUARIO_MOCK && senha === SENHA_MOCK) {
        erro.classList.remove('is-visivel');
        PaoFraternoAuth.login();
        window.location.href = 'painel.html';
      } else {
        erro.classList.add('is-visivel');
      }
    });
  }

  function initMenuMobile() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
      const aberto = menu.classList.toggle('is-aberto');
      toggle.setAttribute('aria-expanded', String(aberto));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLogin();
    initMenuMobile();
  });
})();
