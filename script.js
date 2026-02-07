let fensterListe = [];

function updateUI() {
    const elem = document.getElementById('elemTyp').value;
    const rolllo = document.getElementById('rollloArt').value;
    
    // Zeige Flügel-Config nur bei 2-flg
    document.getElementById('fluegel-config').style.display = (elem === '2' || elem === '2BT') ? 'block' : 'none';
    // Zeige Motor-Config nur bei Elektro
    document.getElementById('motor-config').style.display = (rolllo !== 'KEIN') ? 'block' : 'none';
}

function validateAndAdd() {
    const proj = document.getElementById('projektName').value;
    const pos = document.getElementById('position').value;
    const b = document.getElementById('breite').value;
    const h = document.getElementById('hoehe').value;

    if(!proj || !pos || !b || !h) {
        alert("Bitte alle Pflichtfelder (*) ausfüllen!");
        return;
    }

    const f = {
        proj, pos, b, h,
        system: document.getElementById('systemName').value,
        typ: document.getElementById('elemTyp').value,
        typL: document.getElementById('typL').value,
        typR: document.getElementById('typR').value,
        rolllo: document.getElementById('rollloArt').value,
        motor: document.getElementById('motorSeite').value,
        kabel: document.getElementById('kabelSeite').value,
        notizen: document.getElementById('notizen').value,
        id: Date.now()
    };

    fensterListe.push(f);
    renderList();
    clearInputs();
}

function renderList() {
    const container = document.getElementById('fenster-liste');
    container.innerHTML = fensterListe.map(f => `
        <div class="list-item">
            <span><strong>${f.pos}</strong>: ${f.b} x ${f.h}mm</span>
            <span style="color:red; font-weight:600;" onclick="remove(${f.id})">Löschen</span>
        </div>
    `).join('');
    document.getElementById('count').innerText = fensterListe.length;
    document.getElementById('btn-preview').style.display = fensterListe.length > 0 ? 'block' : 'none';
}

function remove(id) {
    fensterListe = fensterListe.filter(f => f.id !== id);
    renderList();
}

function clearInputs() {
    document.getElementById('position').value = "";
    document.getElementById('breite').value = "";
    document.getElementById('hoehe').value = "";
    document.getElementById('notizen').value = "";
}

function showPreview() {
    document.getElementById('input-view').style.display = 'none';
    document.getElementById('preview-view').style.display = 'block';
    
    const content = document.getElementById('pdf-content');
    const projekt = document.getElementById('projektName').value;
    const system = document.getElementById('systemName').value || "Standard";

    let html = `<h1>Aufmaß: ${projekt}</h1><p>System: ${system} | Datum: ${new Date().toLocaleDateString('de-DE')}</p><hr>`;

    fensterListe.forEach(f => {
        html += `
        <div class="pdf-item">
            <div class="pdf-svg">${generateSVG(f)}</div>
            <div class="pdf-data">
                <h3>${f.pos}</h3>
                <p><strong>RAM:</strong> ${f.b} x ${f.h} mm</p>
                <p><strong>Typ:</strong> ${getTypText(f)}</p>
                <p><strong>Rollladen:</strong> ${f.rolllo === 'KEIN' ? 'Nein' : f.rolllo}</p>
                ${f.rolllo !== 'KEIN' ? `<p><strong>Technik:</strong> Motor ${f.motor} | Kabel ${f.kabel}</p>` : ''}
                ${f.notizen ? `<div class="pdf-notes"><strong>Notiz:</strong> ${f.notizen}</div>` : ''}
            </div>
        </div>`;
    });
    content.innerHTML = html;
}

function getTypText(f) {
    if(f.typ === '2' || f.typ === '2BT') return `2-flg. (L:${f.typL} / R:${f.typR})`;
    return f.typ === 'BT' ? 'Balkontür 1-flg.' : 'Fenster 1-flg.';
}

function hidePreview() {
    document.getElementById('input-view').style.display = 'block';
    document.getElementById('preview-view').style.display = 'none';
}

function generateSVG(f) {
    const is2flg = (f.typ === '2' || f.typ === '2BT');
    const isBT = (f.typ === 'BT' || f.typ === '2BT');

    let svg = `<svg viewBox="-70 -80 440 540" xmlns="http://www.w3.org/2000/svg" style="background:white;">
        <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#000" /></marker></defs>
        <rect x="0" y="0" width="300" height="400" fill="none" stroke="#000" stroke-width="4" />`;

    // DIN Maßketten (Außen liegend)
    svg += `
        <line x1="0" y1="-40" x2="300" y2="-40" stroke="#000" marker-start="url(#arrow)" marker-end="url(#arrow)" />
        <line x1="0" y1="-50" x2="0" y2="0" stroke="#000" stroke-width="0.5" />
        <line x1="300" y1="-50" x2="300" y2="0" stroke="#000" stroke-width="0.5" />
        <text x="150" y="-55" text-anchor="middle" font-size="22" font-weight="bold">${f.b}</text>

        <line x1="-40" y1="0" x2="-40" y2="400" stroke="#000" marker-start="url(#arrow)" marker-end="url(#arrow)" />
        <line x1="-50" y1="0" x2="0" y2="0" stroke="#000" stroke-width="0.5" />
        <line x1="-50" y1="400" x2="0" y2="400" stroke="#000" stroke-width="0.5" />
        <text x="-55" y="200" text-anchor="middle" transform="rotate(-90, -55, 200)" font-size="22" font-weight="bold">${f.h}</text>`;

    // Flügel-Zeichnung
    if(is2flg) {
        svg += `<line x1="150" y1="0" x2="150" y2="400" stroke="#000" stroke-width="2" />`;
        if(f.typL !== 'FEST') svg += `<polyline points="150,0 0,200 150,400" fill="none" stroke="#666" stroke-dasharray="8,5" />`;
        if(f.typR !== 'FEST') svg += `<polyline points="150,0 300,200 150,400" fill="none" stroke="#666" stroke-dasharray="8,5" />`;
    } else {
        svg += `<polyline points="300,0 0,200 300,400" fill="none" stroke="#666" stroke-dasharray="8,5" />`;
    }

    // Balkontür Schwelle
    if(isBT) svg += `<line x1="0" y1="390" x2="300" y2="390" stroke="#000" stroke-width="1" />`;

    // Kabel-Punkt
    if(f.rolllo !== 'KEIN') {
        const kX = f.kabel === 'L' ? 15 : 285;
        svg += `<circle cx="${kX}" cy="15" r="10" fill="red" />`;
        svg += `<text x="${kX}" y="45" text-anchor="middle" font-size="12" fill="red" font-weight="bold">Kabel</text>`;
    }

    return svg + `</svg>`;
}

document.getElementById('header-date').innerText = new Date().toLocaleDateString('de-DE');