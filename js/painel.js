/* =========================================================
   Pão Fraterno — Painel administrativo (painel.html)
   Página protegida: exige sessão (mock) feita no login.
   Depende de auth.js e data.js (carregados antes).

   CRUD em memória (sem backend): os dados vivem apenas
   durante a sessão da página.
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Guarda de rota ----------
     Se não houver sessão, volta para o login antes de montar. */
  if (!PaoFraternoAuth.estaLogado()) {
    window.location.replace('admin.html');
    return;
  }

  // Cópias de trabalho dos dados mockados (não altera o original).
  let avisos = typeof AVISOS_MOCK !== 'undefined' ? AVISOS_MOCK.map((a) => ({ ...a })) : [];
  let itens = typeof ITENS_MOCK !== 'undefined' ? ITENS_MOCK.map((i) => ({ ...i })) : [];
  let proximoIdAviso = Math.max(0, ...avisos.map((a) => a.id)) + 1;
  let proximoIdItem = Math.max(0, ...itens.map((i) => i.id)) + 1;

  // Estado do modal em edição.
  let modalContexto = null; // { tipo: 'aviso'|'item', id: number|null }

  /* ---------- Abas ---------- */
  function initAbas() {
    const abas = document.querySelectorAll('.aba');
    const secoes = document.querySelectorAll('.painel-secao');
    abas.forEach((aba) => {
      aba.addEventListener('click', () => {
        abas.forEach((a) => {
          a.classList.remove('is-ativa');
          a.setAttribute('aria-selected', 'false');
        });
        aba.classList.add('is-ativa');
        aba.setAttribute('aria-selected', 'true');
        const alvo = aba.dataset.aba;
        secoes.forEach((s) => s.classList.toggle('is-ativa', s.id === alvo));
      });
    });
  }

  /* ---------- Render: avisos ---------- */
  function renderAvisos() {
    const tbody = document.getElementById('tbody-avisos');
    if (!tbody) return;

    if (avisos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3">Nenhum aviso publicado.</td></tr>';
      return;
    }

    tbody.innerHTML = avisos.map((aviso) => `
      <tr>
        <td class="tabela__nome" data-rotulo="Título">${escapar(aviso.titulo)}</td>
        <td class="tabela__data" data-rotulo="Data">${escapar(aviso.data)}</td>
        <td class="col-acoes">
          <div class="tabela__acoes">
            <button class="btn-icone" type="button" data-editar-aviso="${aviso.id}">Editar</button>
            <button class="btn-icone btn-icone--perigo" type="button" data-excluir-aviso="${aviso.id}">Excluir</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  /* ---------- Render: itens ---------- */
  function renderItens() {
    const tbody = document.getElementById('tbody-itens');
    if (!tbody) return;

    const ordenados = [...itens].sort(
      (a, b) => URGENCIA_INFO[a.urgencia].ordem - URGENCIA_INFO[b.urgencia].ordem
    );

    if (ordenados.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">Nenhum item cadastrado.</td></tr>';
      return;
    }

    tbody.innerHTML = ordenados.map((item) => {
      const u = URGENCIA_INFO[item.urgencia];
      return `
        <tr>
          <td class="tabela__nome" data-rotulo="Item">${escapar(item.nome)}</td>
          <td data-rotulo="Categoria">${escapar(item.categoria)}</td>
          <td data-rotulo="Urgência">
            <span class="badge-urgencia badge-urgencia--${item.urgencia}">${u.rotulo}</span>
          </td>
          <td class="col-acoes">
            <div class="tabela__acoes">
              <button class="btn-icone" type="button" data-editar-item="${item.id}">Editar</button>
              <button class="btn-icone btn-icone--perigo" type="button" data-excluir-item="${item.id}">Excluir</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  /* ---------- Modal: aviso ---------- */
  const modalAviso = document.getElementById('modal-aviso');
  const formAviso = document.getElementById('form-aviso');

  function abrirModalAviso(id) {
    modalContexto = { tipo: 'aviso', id: id ?? null };
    const titulo = document.getElementById('modal-aviso-titulo');
    const inputTitulo = document.getElementById('aviso-titulo');
    const inputData = document.getElementById('aviso-data');
    const inputConteudo = document.getElementById('aviso-conteudo');

    if (id != null) {
      const aviso = avisos.find((a) => a.id === id);
      titulo.textContent = 'Editar aviso';
      inputTitulo.value = aviso.titulo;
      inputData.value = aviso.data;
      inputConteudo.value = aviso.conteudo;
    } else {
      titulo.textContent = 'Novo aviso';
      formAviso.reset();
    }
    abrirModal(modalAviso);
  }

  function salvarAviso(e) {
    e.preventDefault();
    const dados = {
      titulo: document.getElementById('aviso-titulo').value.trim(),
      data: document.getElementById('aviso-data').value.trim() || 'Esta semana',
      conteudo: document.getElementById('aviso-conteudo').value.trim(),
    };
    if (!dados.titulo || !dados.conteudo) return;

    if (modalContexto.id != null) {
      const aviso = avisos.find((a) => a.id === modalContexto.id);
      Object.assign(aviso, dados);
    } else {
      avisos.unshift({ id: proximoIdAviso++, ...dados });
    }
    renderAvisos();
    fecharModal(modalAviso);
  }

  function excluirAviso(id) {
    if (!confirm('Excluir este aviso? Esta ação não pode ser desfeita.')) return;
    avisos = avisos.filter((a) => a.id !== id);
    renderAvisos();
  }

  /* ---------- Modal: item ---------- */
  const modalItem = document.getElementById('modal-item');
  const formItem = document.getElementById('form-item');

  function abrirModalItem(id) {
    modalContexto = { tipo: 'item', id: id ?? null };
    const titulo = document.getElementById('modal-item-titulo');
    const inputNome = document.getElementById('item-nome');
    const inputCategoria = document.getElementById('item-categoria');
    const inputUrgencia = document.getElementById('item-urgencia');

    if (id != null) {
      const item = itens.find((i) => i.id === id);
      titulo.textContent = 'Editar item';
      inputNome.value = item.nome;
      inputCategoria.value = item.categoria;
      inputUrgencia.value = item.urgencia;
    } else {
      titulo.textContent = 'Novo item';
      formItem.reset();
    }
    abrirModal(modalItem);
  }

  function salvarItem(e) {
    e.preventDefault();
    const dados = {
      nome: document.getElementById('item-nome').value.trim(),
      categoria: document.getElementById('item-categoria').value,
      urgencia: document.getElementById('item-urgencia').value,
    };
    if (!dados.nome) return;

    if (modalContexto.id != null) {
      const item = itens.find((i) => i.id === modalContexto.id);
      Object.assign(item, dados);
    } else {
      itens.push({ id: proximoIdItem++, ...dados });
    }
    renderItens();
    fecharModal(modalItem);
  }

  function excluirItem(id) {
    if (!confirm('Excluir este item? Esta ação não pode ser desfeita.')) return;
    itens = itens.filter((i) => i.id !== id);
    renderItens();
  }

  /* ---------- Modal: utilitários ---------- */
  let elementoFoco = null;

  function abrirModal(modal) {
    elementoFoco = document.activeElement;
    modal.classList.add('is-aberto');
    modal.setAttribute('aria-hidden', 'false');
    const primeiroCampo = modal.querySelector('input, textarea, select');
    if (primeiroCampo) primeiroCampo.focus();
    document.addEventListener('keydown', aoPressionarEsc);
  }

  function fecharModal(modal) {
    modal.classList.remove('is-aberto');
    modal.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', aoPressionarEsc);
    if (elementoFoco) elementoFoco.focus();
  }

  function aoPressionarEsc(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.is-aberto').forEach(fecharModal);
    }
  }

  /* ---------- Sair ---------- */
  function initSair() {
    const btnSair = document.getElementById('btn-sair');
    if (!btnSair) return;
    btnSair.addEventListener('click', (e) => {
      e.preventDefault();
      PaoFraternoAuth.logout();
      window.location.replace('admin.html');
    });
  }

  /* ---------- Delegação de eventos ---------- */
  function initEventos() {
    const btnNovoAviso = document.getElementById('btn-novo-aviso');
    const btnNovoItem = document.getElementById('btn-novo-item');
    btnNovoAviso && btnNovoAviso.addEventListener('click', () => abrirModalAviso(null));
    btnNovoItem && btnNovoItem.addEventListener('click', () => abrirModalItem(null));

    document.addEventListener('click', (e) => {
      const alvo = e.target;
      if (alvo.dataset.editarAviso) abrirModalAviso(Number(alvo.dataset.editarAviso));
      if (alvo.dataset.excluirAviso) excluirAviso(Number(alvo.dataset.excluirAviso));
      if (alvo.dataset.editarItem) abrirModalItem(Number(alvo.dataset.editarItem));
      if (alvo.dataset.excluirItem) excluirItem(Number(alvo.dataset.excluirItem));
    });

    formAviso && formAviso.addEventListener('submit', salvarAviso);
    formItem && formItem.addEventListener('submit', salvarItem);

    document.querySelectorAll('[data-fechar-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        if (modal) fecharModal(modal);
      });
    });
  }

  /* ---------- Helper: escapar HTML ---------- */
  function escapar(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  /* ---------- Menu mobile ---------- */
  function initMenuMobile() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
      const aberto = menu.classList.toggle('is-aberto');
      toggle.setAttribute('aria-expanded', String(aberto));
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    initAbas();
    initEventos();
    initSair();
    initMenuMobile();
    renderAvisos();
    renderItens();
  });
})();
