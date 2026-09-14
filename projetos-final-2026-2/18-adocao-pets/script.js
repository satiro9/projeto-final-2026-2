// ========= Comum: menu mobile, ano no rodapé =========
document.addEventListener('DOMContentLoaded', () => {
  // Preenche o ano automaticamente no footer
  const ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  // Menu mobile (toggle)
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('open'));

    menu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => menu.classList.remove('open'))
    );
  }
});


// ========= Catálogo com filtros =========

const lista = document.getElementById('lista');
const filtros = document.getElementById('filtros');

let filtroAtivo = 'Todos';


// Função pura: dado um filtro, devolve itens filtrados
function filtrar(itens, filtro) {
  if (filtro === 'Todos') return itens;

  return itens.filter(i => i.categoria === filtro);
}


// Formata preço/idade
function formatarPreco(valor) {
  if (typeof valor === 'number') {
    return 'R$ ' + valor.toLocaleString('pt-BR');
  }

  return window.LABEL_PRECO + ' ' + valor;
}


// Renderiza os cards na tela
function renderizar() {
  const itens = filtrar(window.ITENS, filtroAtivo);

  if (itens.length === 0) {
    lista.innerHTML = '<p class="vazio">Nenhum item encontrado.</p>';
    return;
  }

  lista.innerHTML = itens.map(i => `
    <article class="item-card">

      <div class="img">
        <img src="${i.foto}" alt="Foto de ${i.nome}">
      </div>

      <h3>${i.nome}</h3>

      <p>${i.categoria}</p>

      <p class="preco">${formatarPreco(i.preco)}</p>

    </article>
  `).join('');
}


// Eventos nos botões de filtro
filtros.addEventListener('click', (e) => {
  const btn = e.target.closest('.filtro-btn');

  if (!btn) return;

  filtroAtivo = btn.dataset.filtro;

  filtros
    .querySelectorAll('.filtro-btn')
    .forEach(b => b.classList.remove('ativo'));

  btn.classList.add('ativo');

  renderizar();
});


// Marca o primeiro filtro como ativo e renderiza
filtros.querySelector('.filtro-btn')?.classList.add('ativo');

renderizar();