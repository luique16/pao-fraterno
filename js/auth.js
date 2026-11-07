/* =========================================================
   Pão Fraterno — Autenticação (mock, sem backend)
   Módulo compartilhado entre o login (admin.html) e o
   painel protegido (painel.html).

   O estado de sessão precisa sobreviver ao redirecionamento
   entre as duas páginas. Tentamos, em ordem:
     1) sessionStorage (ideal: cai ao fechar a aba)
     2) localStorage  (reserva p/ contextos onde sessionStorage
        é bloqueado, como algumas aberturas via file://)
   Tudo encapsulado em try/catch para nunca quebrar o fluxo.
   ========================================================= */

var PaoFraternoAuth = (function () {
  'use strict';

  const CHAVE_SESSAO = 'paofraterno_admin';

  function tentarEscrever(storage, valor) {
    try {
      if (valor === null) storage.removeItem(CHAVE_SESSAO);
      else storage.setItem(CHAVE_SESSAO, valor);
      return true;
    } catch (e) {
      return false;
    }
  }

  function tentarLer(storage) {
    try {
      return storage.getItem(CHAVE_SESSAO) === '1';
    } catch (e) {
      return false;
    }
  }

  function login() {
    tentarEscrever(window.sessionStorage, '1');
    tentarEscrever(window.localStorage, '1');
  }

  function logout() {
    tentarEscrever(window.sessionStorage, null);
    tentarEscrever(window.localStorage, null);
  }

  function estaLogado() {
    return tentarLer(window.sessionStorage) || tentarLer(window.localStorage);
  }

  return { login, logout, estaLogado };
})();
