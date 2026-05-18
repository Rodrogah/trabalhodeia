let abaAtiva = 'alunos';

function obterDados(colecao) {
    const dados = localStorage.getItem(`gestao_${colecao}`);
    return dados ? JSON.parse(dados) : [];
}

function salvarNoCache(colecao, dados) {
    localStorage.setItem(`gestao_${colecao}`, JSON.stringify(dados));
    atualizarDashboard();
    renderizarLista();
}

function abrirJanelaFlutuante() {
    document.getElementById('janela-flutuante').classList.remove('hidden');
    adaptarCampos();
}

function fecharJanelaFlutuante() {
    document.getElementById('janela-flutuante').classList.add('hidden');
    document.getElementById('form-cadastro').reset();
}

function fecharDetalhes() {
    document.getElementById('janela-detalhes').classList.add('hidden');
}

function abrirDetalhes(id) {
    const dados = obterDados(abaAtiva);
    const item = dados.find(d => d.id === id);
    
    if (item) {
        const container = document.getElementById('conteudo-detalhes');
        let html = `
            <p><span>Nome Principal</span> ${item.nome}</p>
            <p><span>Informação</span> ${item.detalhe}</p>
        `;
        
        if (item.email) {
            html += `<p><span>E-mail</span> <a href="mailto:${item.email}" style="color:#000; text-decoration: none; font-weight: 500;">${item.email}</a></p>`;
        }

        container.innerHTML = html;
        document.getElementById('janela-detalhes').classList.remove('hidden');
    }
}

// --- NOVA FUNÇÃO: Abre o card ao dar Enter na pesquisa ---
function abrirCardPesquisa(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Evita que a página recarregue
        
        const termoBusca = document.getElementById('search-input').value.toLowerCase().trim();
        if (termoBusca === '') return;

        const dados = obterDados(abaAtiva);
        
        // Encontra o primeiro registro que bata com a pesquisa (nome, email ou info)
        const itemEncontrado = dados.find(item => {
            const matchesNome = item.nome.toLowerCase().includes(termoBusca);
            const matchesDetalhe = item.detalhe.toLowerCase().includes(termoBusca);
            const matchesEmail = item.email ? item.email.toLowerCase().includes(termoBusca) : false;
            
            return matchesNome || matchesDetalhe || matchesEmail;
        });

        // Se encontrar alguém, abre a janela de detalhes dessa pessoa
        if (itemEncontrado) {
            abrirDetalhes(itemEncontrado.id);
            // Limpa o input após encontrar, para a tela voltar ao normal quando fechar o card
            document.getElementById('search-input').value = '';
            renderizarLista();
        } else {
            alert("Nenhum registro exato encontrado com este termo.");
        }
    }
}

function adaptarCampos() {
    const tipo = document.getElementById('tipo-cadastro').value;
    const container = document.getElementById('campos-dinamicos');
    
    let html = '';

    if (tipo === 'alunos') {
        html = `
            <div class="input-group"><label>Nome do Aluno</label><input type="text" id="cad-nome" required></div>
            <div class="input-group"><label>Matrícula / RA</label><input type="text" id="cad-info" required></div>
            <div class="input-group"><label>E-mail do Aluno</label><input type="email" id="cad-email" placeholder="exemplo@email.com" required></div>
        `;
    } else if (tipo === 'professores') {
        html = `
            <div class="input-group"><label>Nome do Professor</label><input type="text" id="cad-nome" required></div>
            <div class="input-group"><label>Especialidade</label><input type="text" id="cad-info" required></div>
            <div class="input-group"><label>E-mail Corporativo</label><input type="email" id="cad-email" placeholder="professor@escola.com" required></div>
        `;
    } else if (tipo === 'cursos') {
        html = `
            <div class="input-group"><label>Nome do Curso</label><input type="text" id="cad-nome" required></div>
            <div class="input-group"><label>Turno</label><input type="text" id="cad-info" placeholder="Ex: Noturno" required></div>
        `;
    } else if (tipo === 'materias') {
        html = `
            <div class="input-group"><label>Nome da Matéria</label><input type="text" id="cad-nome" required></div>
            <div class="input-group"><label>Carga Horária</label><input type="text" id="cad-info" placeholder="Ex: 80h" required></div>
        `;
    }

    container.innerHTML = html;
}

function salvarDados(event) {
    event.preventDefault();
    
    const tipo = document.getElementById('tipo-cadastro').value;
    const nome = document.getElementById('cad-nome').value;
    const info = document.getElementById('cad-info').value;
    
    const inputEmail = document.getElementById('cad-email');
    const email = inputEmail ? inputEmail.value : null;
    
    const dadosAtuais = obterDados(tipo);
    
    const novoRegistro = {
        id: Date.now().toString(),
        nome: nome,
        detalhe: info,
        email: email
    };
    
    dadosAtuais.push(novoRegistro);
    salvarNoCache(tipo, dadosAtuais);
    
    mudarAba(tipo);
    fecharJanelaFlutuante();
}

function deletarItem(event, id) {
    event.stopPropagation(); 
    let dados = obterDados(abaAtiva);
    dados = dados.filter(item => item.id !== id);
    salvarNoCache(abaAtiva, dados);
}

function atualizarDashboard() {
    document.getElementById('count-alunos').innerText = obterDados('alunos').length;
    document.getElementById('count-professores').innerText = obterDados('professores').length;
    document.getElementById('count-cursos').innerText = obterDados('cursos').length;
    document.getElementById('count-materias').innerText = obterDados('materias').length;
}

function mudarAba(tipo) {
    abaAtiva = tipo;
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event?.currentTarget?.classList.add('active'); 
    
    // Limpa a pesquisa ao trocar de aba
    document.getElementById('search-input').value = '';
    
    renderizarLista();
}

function renderizarLista() {
    const dados = obterDados(abaAtiva);
    const container = document.getElementById('conteudo-lista');
    const termoBusca = document.getElementById('search-input').value.toLowerCase();
    
    container.innerHTML = '';

    // Filtra os dados conforme a pessoa digita
    const dadosFiltrados = dados.filter(item => {
        const matchesNome = item.nome.toLowerCase().includes(termoBusca);
        const matchesDetalhe = item.detalhe.toLowerCase().includes(termoBusca);
        const matchesEmail = item.email ? item.email.toLowerCase().includes(termoBusca) : false;
        
        return matchesNome || matchesDetalhe || matchesEmail;
    });

    if (dadosFiltrados.length === 0) {
        container.innerHTML = `<p style="text-align:center; color: #666; padding: 20px;">Nenhum registro encontrado.</p>`;
        return;
    }

    dadosFiltrados.forEach(item => {
        container.innerHTML += `
            <div class="list-item" onclick="abrirDetalhes('${item.id}')">
                <div class="item-info">
                    <h4>${item.nome}</h4>
                    <p>${item.detalhe}</p>
                </div>
                <button class="btn-delete" onclick="deletarItem(event, '${item.id}')">✕</button>
            </div>
        `;
    });
}

window.onload = () => {
    atualizarDashboard();
    renderizarLista();
};