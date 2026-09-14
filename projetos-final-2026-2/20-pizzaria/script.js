
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

// ========= Validação simples do formulário =========
const form = document.getElementById('formContato');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // impede o envio padrão
    const feedback = document.getElementById('feedback');
    feedback.style.display = 'block';

    // Pega valores dos campos
    const nome = form.querySelector('#nome')?.value.trim();
    const email = form.querySelector('#email')?.value.trim();
    const mensagem = form.querySelector('#mensagem')?.value.trim();

    // Regex básico para validar e-mail
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');

    if (!nome || !emailOk || !mensagem) {
      feedback.classList.add('erro');
      feedback.textContent = 'Por favor, preencha todos os campos corretamente.';
      return;
    }

    feedback.classList.remove('erro');
    feedback.textContent = `Obrigado, ${nome}! Recebemos sua mensagem e retornaremos em breve.`;
    form.reset();
  });
}

// ========= Catálogo + Carrinho =========
const listaProdutos = document.getElementById('produtos-lista');
const drawer = document.getElementById('drawer');
const carrinhoItens = document.getElementById('carrinho-itens');
const qtdCarrinho = document.getElementById('qtd-carrinho');
const totalEl = document.getElementById('total');

// Estado do carrinho: { idProduto: quantidade }
let carrinho = {};

// Formata número como moeda BRL
function moeda(v) {
  return window.MOEDA + ' ' + v.toFixed(2).replace('.', ',');
}

// Renderiza os produtos disponíveis
function renderizarProdutos() {
  listaProdutos.innerHTML = window.PRODUTOS.map(p => `
    <article class="produto">
      <div class="img">
        <img src="${p.imagem}" alt="${p.nome}">
      </div>
      <h3>${p.nome}</h3>
      <p>${p.desc}</p>
      <div class="preco">${moeda(p.preco)}</div>
      <button onclick="adicionar(${p.id})">${window.CTA}</button>
    </article>
  `).join('');
}

// Adiciona produto ao carrinho
function adicionar(id) {
  carrinho[id] = (carrinho[id] || 0) + 1;
  atualizarCarrinho();
}

// Remove uma unidade do produto
function remover(id) {
  if (!carrinho[id]) return;
  carrinho[id]--;
  if (carrinho[id] <= 0) delete carrinho[id];
  atualizarCarrinho();
}

// Atualiza badge do carrinho e total
function atualizarCarrinho() {
  const ids = Object.keys(carrinho);
  const qtd = ids.reduce((s, id) => s + carrinho[id], 0);
  qtdCarrinho.textContent = qtd;

  if (ids.length === 0) {
    carrinhoItens.innerHTML = '<p style="color:#6b7280;text-align:center;padding:20px;">Carrinho vazio</p>';
    totalEl.textContent = moeda(0);
    return;
  }

  let total = 0;
  carrinhoItens.innerHTML = ids.map(id => {
    const p = window.PRODUTOS.find(x => x.id == id);
    const sub = p.preco * carrinho[id];
    total += sub;
    return `
      <div class="item-c">
        <div style="display:flex;align-items:center;gap:8px;">
          <img src="${p.imagem}" alt="${p.nome}" style="width:36px;height:36px;object-fit:cover;border-radius:6px;">
          <div>
            <strong>${p.nome}</strong><br/>
            <small>${carrinho[id]} × ${moeda(p.preco)} = ${moeda(sub)}</small>
          </div>
        </div>
        <button class="remover" onclick="remover(${p.id})" title="Remover">✕</button>
      </div>
    `;
  }).join('');
  totalEl.textContent = moeda(total);
}

// Abrir / fechar drawer
document.getElementById('abrirCarrinho').addEventListener('click', () => drawer.classList.add('aberto'));
function fecharCarrinho() { drawer.classList.remove('aberto'); }

function finalizarPedido() {
  if (Object.keys(carrinho).length === 0) {
    alert('Seu carrinho está vazio.');
    return;
  }
  alert('Pedido finalizado com sucesso! Entraremos em contato para confirmação.');
  carrinho = {};
  atualizarCarrinho();
  fecharCarrinho();
}

renderizarProdutos();
atualizarCarrinho();