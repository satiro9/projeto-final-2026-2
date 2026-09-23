// ========= Inicialização quando o DOM carrega =========
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

  // Configura os escutadores para busca e filtro de categoria
  const campoBusca = document.getElementById('busca');
  const selectCategoria = document.getElementById('categoria');

  if (campoBusca) {
    campoBusca.addEventListener('input', aplicarFiltros);
  }

  if (selectCategoria) {
    selectCategoria.addEventListener('change', aplicarFiltros);
  }

  // Renderiza produtos e carrinho ao carregar a página
  renderizarProdutos();
  atualizarCarrinho();
});

// ========= Validação simples do formulário de contato =========
const form = document.getElementById('formContato');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    const feedback = document.getElementById('feedback');
    if (!feedback) return;

    feedback.style.display = 'block';

    const nome = form.querySelector('#nome')?.value.trim();
    const email = form.querySelector('#email')?.value.trim();
    const mensagem = form.querySelector('#mensagem')?.value.trim();

    // Validação básica de e-mail via regex
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');

    if (!nome || !emailOk || !mensagem) {
      feedback.className = 'mensagem-feedback erro';
      feedback.style.color = '#dc2626';
      feedback.textContent = 'Por favor, preencha todos os campos corretamente.';
      return;
    }

    feedback.className = 'mensagem-feedback sucesso';
    feedback.style.color = '#16a34a';
    feedback.textContent = `Obrigado, ${nome}! Recebemos sua mensagem e retornaremos em breve.`;
    form.reset();
  });
}

// ========= Estado do Carrinho =========
// Estrutura do objeto: { idProduto: quantidade }
let carrinho = {};
let percentualDesconto = 0;

// Helper: Formata número como moeda BRL (ex: R$ 8,90)
function moeda(v) {
  return (window.MOEDA || 'R$') + ' ' + v.toFixed(2).replace('.', ',');
}

// ========= Renderização dos Produtos =========
function renderizarProdutos(lista = window.PRODUTOS) {
  const listaProdutos = document.getElementById('produtos-lista');
  if (!listaProdutos) return;

  if (!lista || lista.length === 0) {
    listaProdutos.innerHTML = `
      <p style="grid-column: 1/-1; text-align: center; color: #6b7280; padding: 20px;">
        Nenhum produto encontrado.
      </p>`;
    return;
  }

  listaProdutos.innerHTML = lista.map(p => `
    <article class="produto">
      <div class="img">
        <img src="${p.imagem}" alt="${p.nome}" loading="lazy">
      </div>
      <h3>${p.nome}</h3>
      <p style="color: #666; font-size: 0.85rem; margin: 4px 0;">${p.desc}</p>
      <div class="preco">${moeda(p.preco)}</div>
      <button onclick="adicionar(${p.id})">${window.CTA || 'Adicionar'}</button>
    </article>
  `).join('');
}

// ========= Filtros e Busca =========
function aplicarFiltros() {
  const campoBusca = document.getElementById('busca');
  const selectCategoria = document.getElementById('categoria');

  const textoBusca = campoBusca ? campoBusca.value.toLowerCase().trim() : '';
  const categoriaSelecionada = selectCategoria ? selectCategoria.value : 'todos';

  const produtosFiltrados = (window.PRODUTOS || []).filter(produto => {
    const bateComTexto = produto.nome.toLowerCase().includes(textoBusca) || 
                         produto.desc.toLowerCase().includes(textoBusca);
    
    const bateComCategoria = categoriaSelecionada === 'todos' || produto.categoria === categoriaSelecionada;

    return bateComTexto && bateComCategoria;
  });

  renderizarProdutos(produtosFiltrados);
}

// ========= Gerenciamento de Cupom de Desconto =========
function aplicarCupom() {
  const inputCupom = document.getElementById('cupom');
  if (!inputCupom) return;

  const codigo = inputCupom.value.trim().toUpperCase();

  if (codigo === 'PROMO10') {
    percentualDesconto = 0.10; // 10%
    alert('Cupom PROMO10 aplicado com sucesso! (10% de desconto)');
  } else if (codigo === '') {
    percentualDesconto = 0;
    alert('Por favor, digite um código de cupom.');
  } else {
    percentualDesconto = 0;
    alert('Cupom inválido!');
  }

  atualizarCarrinho();
}

// ========= Ações do Carrinho =========
function adicionar(id) {
  carrinho[id] = (carrinho[id] || 0) + 1;
  atualizarCarrinho();
}

function remover(id) {
  if (!carrinho[id]) return;
  carrinho[id]--;
  if (carrinho[id] <= 0) delete carrinho[id];
  atualizarCarrinho();
}

function removerTodos(id) {
  delete carrinho[id];
  atualizarCarrinho();
}

// ========= Atualização do Carrinho na Interface =========
function atualizarCarrinho() {
  const carrinhoItens = document.getElementById('carrinho-itens');
  const qtdCarrinho = document.getElementById('qtd-carrinho');
  const totalEl = document.getElementById('total');

  const ids = Object.keys(carrinho);
  const qtdTotal = ids.reduce((s, id) => s + carrinho[id], 0);

  if (qtdCarrinho) qtdCarrinho.textContent = qtdTotal;

  // Carrinho Vazio
  if (ids.length === 0) {
    if (carrinhoItens) {
      carrinhoItens.innerHTML = '<p style="color:#6b7280; text-align:center; padding:30px 0;">Seu carrinho está vazio.</p>';
    }
    if (totalEl) totalEl.textContent = moeda(0);
    return;
  }

  let subtotal = 0;

  // Renderiza a lista de itens
  if (carrinhoItens) {
    carrinhoItens.innerHTML = ids.map(id => {
      const p = (window.PRODUTOS || []).find(x => x.id == id);
      if (!p) return '';

      const sub = p.preco * carrinho[id];
      subtotal += sub;

      return `
        <div class="item-c" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${p.imagem}" alt="${p.nome}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px;">
            <div>
              <strong style="font-size: 0.95rem;">${p.nome}</strong><br/>
              <small style="color: #666;">${moeda(p.preco)} cada</small>
            </div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="display: flex; align-items: center; border: 1px solid #ddd; border-radius: 6px; overflow: hidden;">
              <button onclick="remover(${p.id})" style="padding: 2px 8px; background: #f3f4f6; border: 0; cursor: pointer; font-weight: bold;">-</button>
              <span style="padding: 2px 8px; font-size: 0.85rem; font-weight: 600;">${carrinho[id]}</span>
              <button onclick="adicionar(${p.id})" style="padding: 2px 8px; background: #f3f4f6; border: 0; cursor: pointer; font-weight: bold;">+</button>
            </div>
            <button class="remover" onclick="removerTodos(${p.id})" title="Remover item" style="background: transparent; border: 0; color: #dc2626; cursor: pointer; font-size: 1.1rem; margin-left: 4px;">✕</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Cálculo de desconto e total
  const totalComDesconto = subtotal * (1 - percentualDesconto);

  if (totalEl) {
    if (percentualDesconto > 0) {
      totalEl.innerHTML = `
        <span style="text-decoration: line-through; font-size: 0.85rem; color: #9ca3af; margin-right: 6px;">${moeda(subtotal)}</span>
        <span>${moeda(totalComDesconto)}</span>
      `;
    } else {
      totalEl.textContent = moeda(subtotal);
    }
  }
}

// ========= Drawer do Carrinho (Abrir e Fechar) =========
const btnAbrirCarrinho = document.getElementById('abrirCarrinho');
const drawer = document.getElementById('drawer');

if (btnAbrirCarrinho && drawer) {
  btnAbrirCarrinho.addEventListener('click', () => {
    drawer.classList.add('aberto');
  });
}

function fecharCarrinho() { 
  if (drawer) drawer.classList.remove('aberto'); 
}

// ========= Finalização do Pedido (WhatsApp) =========
function finalizarPedido() {
  const ids = Object.keys(carrinho);
  if (ids.length === 0) {
    alert('Seu carrinho está vazio.');
    return;
  }

  // Captura o método de pagamento
  const elPagamento = document.getElementById('pagamento');
  const pagamentoTexto = elPagamento ? elPagamento.options[elPagamento.selectedIndex].text : 'Não informada';

  // Montagem do texto do pedido
  let mensagem = '🛒 *Novo Pedido - Feira Verde*\n\n';
  let subtotal = 0;

  ids.forEach(id => {
    const p = (window.PRODUTOS || []).find(x => x.id == id);
    if (p) {
      const sub = p.preco * carrinho[id];
      subtotal += sub;
      mensagem += `• ${carrinho[id]}x ${p.nome} - ${moeda(sub)}\n`;
    }
  });

  const totalFinal = subtotal * (1 - percentualDesconto);

  mensagem += `\n----------------------------------`;
  if (percentualDesconto > 0) {
    mensagem += `\n*Subtotal:* ${moeda(subtotal)}`;
    mensagem += `\n*Desconto Aplicado:* ${(percentualDesconto * 100)}%`;
  }
  mensagem += `\n*Total a pagar:* ${moeda(totalFinal)}`;
  mensagem += `\n*Forma de Pagamento:* ${pagamentoTexto}`;
  mensagem += `\n----------------------------------`;

  // Número do WhatsApp de recepção (DDD + Número)
  const telefone = "5511999999999"; 
  
  // Abre o link direto no WhatsApp
  window.open(`https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`, '_blank');
}