/* =========================================================
   Pão Fraterno — Comportamento da Home
   Depende de data.js (carregado antes deste arquivo).
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Menu mobile (hambúrguer) ---------- */
  function initMenuMobile() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    const fechar = () => {
      menu.classList.remove('is-aberto');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
      const aberto = menu.classList.toggle('is-aberto');
      toggle.setAttribute('aria-expanded', String(aberto));
    });

    // Fecha ao clicar num link do menu.
    menu.querySelectorAll('a').forEach((link) =>
      link.addEventListener('click', fechar)
    );

    // Fecha ao voltar para desktop.
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) fechar();
    });
  }

  /* ---------- Carrossel ---------- */
  function initCarrossel() {
    const carrossel = document.querySelector('[data-carrossel]');
    if (!carrossel) return;

    const trilho = carrossel.querySelector('.carrossel__trilho');
    const slides = Array.from(carrossel.querySelectorAll('.carrossel__slide'));
    const pontos = Array.from(carrossel.querySelectorAll('.carrossel__ponto'));
    const btnAnterior = carrossel.querySelector('.carrossel__seta--anterior');
    const btnProximo = carrossel.querySelector('.carrossel__seta--proximo');
    let atual = 0;
    let timer = null;

    function ir(indice) {
      atual = (indice + slides.length) % slides.length;
      trilho.style.transform = `translateX(-${atual * 100}%)`;
      pontos.forEach((p, i) => p.classList.toggle('is-ativo', i === atual));
      slides.forEach((s, i) => s.setAttribute('aria-hidden', String(i !== atual)));
    }

    function proximo() { ir(atual + 1); }
    function anterior() { ir(atual - 1); }

    function iniciarAuto() {
      pararAuto();
      timer = setInterval(proximo, 5000);
    }
    function pararAuto() {
      if (timer) clearInterval(timer);
    }

    btnProximo && btnProximo.addEventListener('click', () => { proximo(); iniciarAuto(); });
    btnAnterior && btnAnterior.addEventListener('click', () => { anterior(); iniciarAuto(); });
    pontos.forEach((p, i) =>
      p.addEventListener('click', () => { ir(i); iniciarAuto(); })
    );

    carrossel.addEventListener('mouseenter', pararAuto);
    carrossel.addEventListener('mouseleave', iniciarAuto);

    ir(0);
    iniciarAuto();
  }

  /* ---------- Avisos (render + expandir) ---------- */
  function initAvisos() {
    const lista = document.getElementById('lista-avisos');
    if (!lista || typeof AVISOS_MOCK === 'undefined') return;

    lista.innerHTML = AVISOS_MOCK.map((aviso, i) => `
      <article class="aviso${i === 0 ? ' is-aberto' : ''}">
        <button class="aviso__cabecalho" type="button"
                aria-expanded="${i === 0}" aria-controls="aviso-corpo-${aviso.id}">
          <span class="aviso__data">${aviso.data}</span>
          <span class="aviso__titulo">${aviso.titulo}</span>
          <span class="aviso__seta" aria-hidden="true">▲</span>
        </button>
        <div class="aviso__corpo" id="aviso-corpo-${aviso.id}">
          <div class="aviso__corpo-interno">
            <p class="aviso__texto">${aviso.conteudo}</p>
          </div>
        </div>
      </article>
    `).join('');

    lista.querySelectorAll('.aviso__cabecalho').forEach((botao) => {
      botao.addEventListener('click', () => {
        const aviso = botao.closest('.aviso');
        const aberto = aviso.classList.toggle('is-aberto');
        botao.setAttribute('aria-expanded', String(aberto));
      });
    });
  }

  /* ---------- Lista de itens (render + filtros) ---------- */
  function initItens() {
    const lista = document.getElementById('lista-itens');
    const filtros = document.querySelector('[data-filtros]');
    if (!lista || typeof ITENS_MOCK === 'undefined') return;

    let categoriaAtiva = 'Todos';

    function ordenados() {
      return [...ITENS_MOCK].sort(
        (a, b) => URGENCIA_INFO[a.urgencia].ordem - URGENCIA_INFO[b.urgencia].ordem
      );
    }

    function render() {
      const itens = ordenados().filter(
        (item) => categoriaAtiva === 'Todos' || item.categoria === categoriaAtiva
      );

      if (itens.length === 0) {
        lista.innerHTML = '<p class="lista-vazia">Nenhum item nesta categoria no momento.</p>';
        return;
      }

      lista.innerHTML = itens.map((item) => {
        const u = URGENCIA_INFO[item.urgencia];
        return `
          <article class="item-doacao">
            <div>
              <p class="item-doacao__nome">${item.nome}</p>
              <p class="item-doacao__categoria">${item.categoria}</p>
            </div>
            <span class="badge-urgencia badge-urgencia--${item.urgencia}">${u.rotulo}</span>
          </article>
        `;
      }).join('');
    }

    if (filtros) {
      filtros.querySelectorAll('.filtro').forEach((botao) => {
        botao.addEventListener('click', () => {
          filtros.querySelectorAll('.filtro').forEach((b) => {
            b.classList.remove('is-ativo');
            b.setAttribute('aria-pressed', 'false');
          });
          botao.classList.add('is-ativo');
          botao.setAttribute('aria-pressed', 'true');
          categoriaAtiva = botao.dataset.categoria;
          render();
        });
      });
    }

    render();
  }

  /* ---------- Copiar chave PIX ---------- */
  function initPix() {
    const botoes = document.querySelectorAll('[data-copiar-pix]');
    if (!botoes.length) return;

    async function copiar(texto) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(texto);
          return true;
        }
      } catch (e) {
        /* cai no fallback abaixo */
      }
      // Fallback para contextos não seguros (ex.: file://).
      try {
        const area = document.createElement('textarea');
        area.value = texto;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(area);
        return ok;
      } catch (e) {
        return false;
      }
    }

    botoes.forEach((botao) => {
      const textoOriginal = botao.textContent;
      botao.addEventListener('click', async () => {
        const chave = botao.dataset.copiarPix || (typeof CHAVE_PIX !== 'undefined' ? CHAVE_PIX : '');
        const ok = await copiar(chave);
        mostrarToast(ok ? '✓ Chave Pix copiada!' : 'Não foi possível copiar. Copie manualmente.');
        if (ok) {
          botao.textContent = 'Copiado!';
          setTimeout(() => { botao.textContent = textoOriginal; }, 2000);
        }
      });
    });
  }

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function mostrarToast(mensagem) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = mensagem;
    toast.classList.add('is-visivel');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visivel'), 2800);
  }

  /* ---------- Formulário de voluntário (mock) ---------- */
  function initFormVoluntario() {
    const form = document.getElementById('form-voluntario');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const horarios = form.querySelectorAll('input[name="horario"]:checked');
      if (horarios.length === 0) {
        mostrarToast('Escolha pelo menos um horário.');
        return;
      }
      mostrarToast('✓ Recebemos seus dados. A equipe vai te chamar!');
      form.reset();
    });
  }

  /* ---------- Destaque do item de menu durante a rolagem ---------- */
  function initScrollSpy() {
    const secoes = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-menu__link[href^="#"]');
    if (!secoes.length || !links.length || !('IntersectionObserver' in window)) return;

    const mapa = {};
    links.forEach((link) => { mapa[link.getAttribute('href').slice(1)] = link; });

    const observer = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting && mapa[entrada.target.id]) {
            links.forEach((l) => l.removeAttribute('aria-current'));
            mapa[entrada.target.id].setAttribute('aria-current', 'page');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    secoes.forEach((s) => observer.observe(s));
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    initMenuMobile();
    initCarrossel();
    initAvisos();
    initItens();
    initPix();
    initFormVoluntario();
    initScrollSpy();
  });
})();
