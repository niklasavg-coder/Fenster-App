let fensterListe = JSON.parse(localStorage.getItem('FensterProDB_v2')) || [];
let editId = null;

function updateUI() {
    const elem = document.getElementById('elemTyp').value;
    const rolllo = document.getElementById('rollloArt').value;
    document.getElementById('row-typR').style.display = (elem === '2' || elem === '2BT') ? 'flex' : 'none';
    document.getElementById('motor-box').style.display = (rolllo !== 'KEIN') ? 'block' : 'none';
}

function saveItem() {
    const proj = document.getElementById('projektName').value;
    const b = document.getElementById('breite').value;
    const h = document.getElementById('hoehe').value;
    
    if(!proj || !b || !h) return alert("Fehler: Projekt, Breite und Höhe sind Pflichtfelder!");

    const data = {
        proj, b, h,
        sys: document.getElementById('systemName').value,
        pos: document.getElementById('position').value || "Fenster",
        typ: document.getElementById('elemTyp').value,
        typL: document.getElementById('typL').value,
        typR: document.getElementById('typR').value,
        rolllo: document.getElementById('rollloArt').value,
        motor: document.getElementById('motorSeite').value,
        kabel: document.getElementById('kabelSeite').value,
        notizen: document.getElementById('notizen').value,
        id: editId || Date.now()
    };

    if(editId) {
        const idx = fensterListe.findIndex(f => f.id === editId);
        fensterListe[idx] = data;
    } else {
        fensterListe.push(data);
    }

    localStorage.setItem('FensterProDB_v2', JSON.stringify(fensterListe));
    resetForm();
    render();
}

function edit(id) {
    const f = fensterListe.find(x => x.id === id);
    editId = id;
    document.getElementById('position').value = f.pos;
    document.getElementById('breite').value = f.b;
    document.getElementById('hoehe').value = f.h;
    document.getElementById('elemTyp').value = f.typ;
    document.getElementById('typL').value = f.typL;
    document.getElementById('typR').value = f.typR;
    document.getElementById('rollloArt').value = f.rolllo;
    document.getElementById('motorSeite').value = f.motor;
    document.getElementById('kabelSeite').value = f.kabel;
    document.getElementById('notizen').value = f.notizen;
    
    document.getElementById('add-btn').style.display = 'none';
    document.getElementById('update-btn').style.display = 'block';
    updateUI();
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function remove(id) {
    if(!confirm("Eintrag unwiderruflich löschen?")) return;
    fensterListe = fensterListe.filter(x => x.id !== id);
    localStorage.setItem('FensterProDB_v2', JSON.stringify(fensterListe));
    render();
}

function clearAll() {
    if(!confirm("Gesamtes Projekt löschen?")) return;
    fensterListe = [];
    localStorage.removeItem('FensterProDB_v2');
    render();
}

function render() {
    const container = document.getElementById('fenster-liste');
    container.innerHTML = fensterListe.map(f => `
        <div class="list-item">
            <span><strong>${f.pos}</strong>: ${f.b}x${f.h}mm</span>
            <div class="actions">
                <span style="color:var(--ios-blue); font-weight:600;" onclick="edit(${f.id})">Edit</span>
                <span style="color:var(--ios-red); font-weight:600; margin-left:15px;" onclick="remove(${f.id})">X</span>
            </div>
        </div>`).join('');
    document.getElementById('count').innerText = fensterListe.length;
    document.getElementById('btn-preview').style.display = fensterListe.length > 0 ? 'block' : 'none';
    document.getElementById('btn-clear').style.display = fensterListe.length > 0 ? 'block' : 'none';
}

function generateSVG(f) {
    const is2flg = (f.typ === '2' || f.typ === '2BT');
    const isBT = (f.typ === 'BT' || f.typ === '2BT');
    const hasAufsatz = (f.rolllo === 'AUFSATZ');

    let svg = `<svg viewBox="-70 -110 440 580" xmlns="http://www.w3.org/2000/svg" style="background:white;">
        <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#000" /></marker></defs>`;

    // AUFSATZROLLO VISUALISIERUNG
    if(hasAufsatz) {
        svg += `<rect x="0" y="-50" width="300" height="50" fill="#f0f0f0" stroke="#000" stroke-width="2" />
                <text x="150" y="-20" text-anchor="middle" font-size="14" font-weight="bold">AUFSATZROLLO</text>`;
    }

    svg += `<rect x="0" y="0" width="300" height="400" fill="none" stroke="#000" stroke-width="4" />`;

    // DIN MAẞKETTEN (Außen liegend)
    svg += `
        <line x1="0" y1="-65" x2="300" y2="-65" stroke="#000" marker-start="url(#arrow)" marker-end="url(#arrow)" />
        <text x="150" y="-75" text-anchor="middle" font-size="24" font-weight="bold">${f.b}</text>
        <line x1="-55" y1="0" x2="-55" y2="400" stroke="#000" marker-start="url(#arrow)" marker-end="url(#arrow)" />
        <text x="-65" y="200" text-anchor="middle" transform="rotate(-90, -65, 200)" font-size="24" font-weight="bold">${f.h}</text>`;

    // DIN ÖFFNUNGSSYMBOLE (2-fach Dreieck für DK)
    const drawDIN = (x, w, typ) => {
        if(typ === 'FEST') return "";
        // Dreh-Symbol
        let res = `<polyline points="${x+w-5},10 ${x+10},200 ${x+w-5},390" fill="none" stroke="#666" stroke-dasharray="8,4" />`;
        // Kipp-Symbol (V-Form nach unten)
        if(typ === 'DK') res += `<polyline points="${x+10},10 ${x+w/2},390 ${x+w-10},10" fill="none" stroke="#666" stroke-dasharray="8,4" />`;
        return res;
    };

    if(is2flg) {
        svg += `<line x1="150" y1="0" x2="150" y2="400" stroke="#000" stroke-width="2" />`;
        svg += drawDIN(0, 150, f.typL) + drawDIN(150, 150, f.typR);
    } else {
        svg += drawDIN(0, 300, f.typL);
    }

    if(isBT) svg += `<line x1="0" y1="395" x2="300" y2="395" stroke="#000" stroke-width="1.5" />`;

    if(f.rolllo !== 'KEIN') {
        const kX = f.kabel === 'L' ? 15 : 285;
        svg += `<circle cx="${kX}" cy="15" r="12" fill="red" stroke="white" stroke-width="2" />
                <text x="${kX}" y="45" text-anchor="middle" font-size="12" fill="red" font-weight="bold">Kabel</text>`;
    }
    return svg + `</svg>`;
}

function showPreview() {
    document.getElementById('input-view').style.display = 'none';
    document.getElementById('preview-view').style.display = 'block';
    const proj = document.getElementById('projektName').value;
    const sys = document.getElementById('systemName').value || "Standard";
    
    let html = `
        <div style="display:flex; justify-content:space-between; align-items:flex-end;">
            <div><h2 style="margin:0;">Projekt: ${proj}</h2><p style="margin:5px 0 0;">System: ${sys}</p></div>
            <div style="font-size:10px; color:#888;">Erstellt am: ${new Date().toLocaleDateString()}</div>
        </div><hr style="border:1px solid #000; margin:15px 0;">`;
    
    fensterListe.forEach(f => {
        html += `
        <div class="pdf-item">
            <div class="pdf-svg">${generateSVG(f)}</div>
            <div class="pdf-data">
                <h3>${f.pos}</h3>
                <p><strong>RAM:</strong> ${f.b} x ${f.h} mm</p>
                <p><strong>Typ:</strong> ${f.typ === '1' ? '1-flg. Fenster' : f.typ === '2' ? '2-flg. Stulp' : 'Balkontür'}</p>
                <p><strong>Beschlag:</strong> L:${f.typL} / R:${f.typR}</p>
                <p><strong>Rollo:</strong> ${f.rolllo !== 'KEIN' ? f.rolllo + ' (Mot:' + f.motor + '/Kab:' + f.kabel + ')' : 'Nein'}</p>
                ${f.notizen ? `<div class="pdf-note-box"><strong>Notiz:</strong> ${f.notizen}</div>` : ''}
            </div>
        </div>`;
    });
    document.getElementById('pdf-content').innerHTML = html;
    window.scrollTo(0,0);
}

function hidePreview() { document.getElementById('preview-view').style.display = 'none'; document.getElementById('input-view').style.display = 'block'; }
function resetForm() { document.getElementById('position').value = ""; document.getElementById('breite').value = ""; document.getElementById('hoehe').value = ""; document.getElementById('notizen').value = ""; document.getElementById('add-btn').style.display = 'block'; document.getElementById('update-btn').style.display = 'none'; editId = null; }

document.getElementById('header-date').innerText = new Date().toLocaleDateString('de-DE');
render();
updateUI();