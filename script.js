let fensterListe = [];

function updateUI() {
    const motor = document.getElementById('motorTyp').value;
    document.getElementById('kabel-row').style.display = (motor === 'ELEKTRO') ? 'flex' : 'none';
}

function addToList() {
    const b = document.getElementById('breite').value;
    const h = document.getElementById('hoehe').value;
    const pos = document.getElementById('position').value || "Fenster";

    if(!b || !h) return alert("Maße fehlen!");

    const item = {
        pos: pos,
        b: b,
        h: h,
        typ: document.getElementById('elemTyp').value,
        glas: document.getElementById('glasTyp').value,
        motor: document.getElementById('motorTyp').value,
        kabel: document.getElementById('kabelSeite').value,
        id: Date.now()
    };

    fensterListe.push(item);
    renderListe();
    clearInputs();
}

function renderListe() {
    const container = document.getElementById('fenster-liste');
    container.innerHTML = "";
    fensterListe.forEach(f => {
        container.innerHTML += `
            <div class="list-item">
                <span><strong>${f.pos}</strong>: ${f.b} x ${f.h}mm</span>
                <span style="color:red;" onclick="remove(${f.id})">Löschen</span>
            </div>`;
    });
    document.getElementById('count').innerText = fensterListe.length;
    document.getElementById('btn-preview').style.display = fensterListe.length > 0 ? 'block' : 'none';
}

function remove(id) {
    fensterListe = fensterListe.filter(f => f.id !== id);
    renderListe();
}

function clearInputs() {
    document.getElementById('position').value = "";
    document.getElementById('breite').value = "";
    document.getElementById('hoehe').value = "";
}

function showPreview() {
    document.getElementById('preview-screen').style.display = 'block';
    const content = document.getElementById('pdf-content');
    const projekt = document.getElementById('projektName').value || "Aufmaß-Projekt";
    
    let html = `<h1>Aufmaß: ${projekt}</h1><hr>`;
    
    fensterListe.forEach(f => {
        html += `
        <div class="pdf-item">
            <div class="pdf-svg">${generateSVG(f)}</div>
            <div class="pdf-data">
                <h3>${f.pos}</h3>
                <p>Maß: ${f.b} x ${f.h} mm (RAM)</p>
                <p>Glas: ${f.glas}</p>
                <p>Antrieb: ${f.motor} ${f.motor === 'ELEKTRO' ? '| Kabel: ' + f.kabel : ''}</p>
                <p>Typ: ${f.typ === '1' ? '1-flg. Fenster' : f.typ === '2' ? '2-flg. Stulp' : 'Balkontür'}</p>
            </div>
        </div>`;
    });
    
    content.innerHTML = html;
}

function hidePreview() { document.getElementById('preview-screen').style.display = 'none'; }

function generateSVG(f) {
    // DIN GERECHTE MASSKETTEN LOGIK
    return `
    <svg viewBox="-60 -60 420 520" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto">
                <path d="M0,0 L0,6 L9,3 z" fill="#000" />
            </marker>
        </defs>
        <rect x="0" y="0" width="300" height="400" fill="none" stroke="#000" stroke-width="4" />
        
        <line x1="0" y1="-30" x2="300" y2="-30" stroke="#000" marker-start="url(#arrow)" marker-end="url(#arrow)" />
        <line x1="0" y1="-40" x2="0" y2="0" stroke="#000" stroke-width="0.5" />
        <line x1="300" y1="-40" x2="300" y2="0" stroke="#000" stroke-width="0.5" />
        <text x="150" y="-45" text-anchor="middle" font-size="22" font-weight="bold">${f.b}</text>

        <line x1="-30" y1="0" x2="-30" y2="400" stroke="#000" marker-start="url(#arrow)" marker-end="url(#arrow)" />
        <line x1="-40" y1="0" x2="0" y2="0" stroke="#000" stroke-width="0.5" />
        <line x1="-40" y1="400" x2="0" y2="400" stroke="#000" stroke-width="0.5" />
        <text x="-45" y="200" text-anchor="middle" transform="rotate(-90, -45, 200)" font-size="22" font-weight="bold">${f.h}</text>

        ${f.typ === '2' ? '<line x1="150" y1="0" x2="150" y2="400" stroke="#000" />' : ''}
        ${f.typ !== 'FEST' ? '<polyline points="300,0 0,200 300,400" fill="none" stroke="#666" stroke-dasharray="5,5" />' : ''}
        
        ${f.motor === 'ELEKTRO' ? `<circle cx="${f.kabel === 'RL' ? 15 : 285}" cy="15" r="10" fill="red" />` : ''}
    </svg>`;
}