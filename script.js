// 1. DADOS DO USUÁRIO ATUAL (A Estrutura Principal)
let usuarioAtual = null;
let bancoDeDados = {}; // Aqui vai ficar tudo (senha, histórico, listas)

// 2. INICIALIZAÇÃO
window.onload = function() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (usuarioLogado) {
        usuarioAtual = usuarioLogado;
        carregarDadosPerfil();
        mostrarSistema();
    }
};

// 3. SISTEMA DE LOGIN COM SENHA
function fazerLogin() {
    const nomeInput = document.getElementById('nome-usuario').value.trim();
    const senhaInput = document.getElementById('senha-usuario').value.trim();

    if (nomeInput === '' || senhaInput === '') {
        alert('Por favor, preencha usuário e senha.');
        return;
    }

    // Busca no "banco de dados" do navegador se a pessoa já existe
    const dadosSalvos = localStorage.getItem(`perfil_${nomeInput}`);

    if (dadosSalvos) {
        // A pessoa existe! Vamos checar a senha.
        const perfil = JSON.parse(dadosSalvos);
        if (perfil.senha !== senhaInput) {
            alert('Senha incorreta! Tente novamente.');
            return;
        }
        bancoDeDados = perfil; // Carrega os dados dela
    } else {
        // Primeira vez acessando: cria um perfil novo
        bancoDeDados = {
            senha: senhaInput,
            transacoes: [],
            despesasFixas: [],
            wishlist: []
        };
    }

    usuarioAtual = nomeInput;
    localStorage.setItem('usuarioLogado', usuarioAtual);
    salvarDadosPerfil();
    
    // Limpa campos de login
    document.getElementById('senha-usuario').value = '';
    
    mostrarSistema();
    atualizarTudo();
}

function fazerLogout() {
    usuarioAtual = null;
    bancoDeDados = {};
    localStorage.removeItem('usuarioLogado');
    esconderSistema();
}

// 4. NAVEGAÇÃO DE TELAS
function mostrarSistema() {
    document.getElementById('tela-login').classList.add('escondido');
    document.getElementById('tela-sistema').classList.remove('escondido');
    document.getElementById('nome-exibicao').innerText = usuarioAtual;
    atualizarTudo();
}

function esconderSistema() {
    document.getElementById('tela-sistema').classList.add('escondido');
    document.getElementById('tela-login').classList.remove('escondido');
}

// 5. FUNÇÕES DE GRAVAÇÃO
function salvarDadosPerfil() {
    localStorage.setItem(`perfil_${usuarioAtual}`, JSON.stringify(bancoDeDados));
}

function carregarDadosPerfil() {
    const dadosSalvos = localStorage.getItem(`perfil_${usuarioAtual}`);
    if (dadosSalvos) {
        bancoDeDados = JSON.parse(dadosSalvos);
    }
}

// 6. ADICIONAR ITENS (Transações, Fixas e Wishlist)
function adicionarTransacao() {
    const desc = document.getElementById('descricao-transacao').value.trim();
    const valor = parseFloat(document.getElementById('valor-transacao').value);
    const tipo = document.getElementById('tipo-transacao').value;

    if (desc === '' || isNaN(valor) || valor <= 0) return;

    bancoDeDados.transacoes.push({ desc, valor, tipo, id: Date.now() });
    
    document.getElementById('descricao-transacao').value = '';
    document.getElementById('valor-transacao').value = '';
    
    salvarDadosPerfil();
    atualizarTudo();
}

function adicionarFixa() {
    const desc = document.getElementById('desc-fixa').value.trim();
    const valor = parseFloat(document.getElementById('valor-fixa').value);

    if (desc === '' || isNaN(valor) || valor <= 0) return;

    bancoDeDados.despesasFixas.push({ desc, valor, id: Date.now() });
    
    document.getElementById('desc-fixa').value = '';
    document.getElementById('valor-fixa').value = '';
    
    salvarDadosPerfil();
    atualizarTudo();
}

function adicionarDesejo() {
    const desc = document.getElementById('desc-desejo').value.trim();
    const valor = parseFloat(document.getElementById('valor-desejo').value);

    if (desc === '' || isNaN(valor) || valor <= 0) return;

    bancoDeDados.wishlist.push({ desc, valor, id: Date.now() });
    
    document.getElementById('desc-desejo').value = '';
    document.getElementById('valor-desejo').value = '';
    
    salvarDadosPerfil();
    atualizarTudo();
}

// 7. MOTOR DE ATUALIZAÇÃO DA INTERFACE
function atualizarTudo() {
    // Atualiza Transações e Saldo
    let saldo = 0;
    let gastos = 0;
    const ulTransacoes = document.getElementById('lista-transacoes');
    ulTransacoes.innerHTML = '';

    // Loop de trás para frente para mostrar a mais recente primeiro
    [...bancoDeDados.transacoes].reverse().forEach(t => {
        if (t.tipo === 'ganho') saldo += t.valor;
        else { saldo -= t.valor; gastos += t.valor; }

        const li = document.createElement('li');
        const classeCor = t.tipo === 'ganho' ? 'valor-positivo' : 'valor-negativo';
        const sinal = t.tipo === 'ganho' ? '+' : '-';
        
        li.innerHTML = `
            <span>${t.desc}</span>
            <span class="${classeCor}">${sinal} R$ ${t.valor.toFixed(2).replace('.', ',')}</span>
        `;
        ulTransacoes.appendChild(li);
    });

    document.getElementById('saldo-total').innerText = `R$ ${saldo.toFixed(2).replace('.', ',')}`;
    document.getElementById('gastos-total').innerText = `R$ ${gastos.toFixed(2).replace('.', ',')}`;

    // Atualiza Despesas Fixas
    const ulFixas = document.getElementById('lista-fixas');
    ulFixas.innerHTML = '';
    bancoDeDados.despesasFixas.forEach(f => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${f.desc}</span> <span>R$ ${f.valor.toFixed(2).replace('.', ',')} /mês</span>`;
        ulFixas.appendChild(li);
    });

    // Atualiza Wishlist
    const ulWish = document.getElementById('lista-desejos');
    ulWish.innerHTML = '';
    bancoDeDados.wishlist.forEach(w => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${w.desc}</span> <span>Meta: R$ ${w.valor.toFixed(2).replace('.', ',')}</span>`;
        ulWish.appendChild(li);
    });
}