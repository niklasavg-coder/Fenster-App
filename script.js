let fensterListe = JSON.parse(localStorage.getItem('FensterProDB_V12')) || [];
let editId = null;

function updateUI() {
    const elem = document.getElementById('elemTyp').value;
    const rolllo = document.getElementById('rollloArt').value;
    document.getElementById('row-f2').style.display = elem.includes('Stulp') ? 'flex' : 'none';
    document.getElementById('motor-config').style.display = (rolllo !== 'Kein Rollladen') ? 'block' : 'none';
}

function saveItem() {
    const proj = document.getElementById('projektName').value;
    const b = document.getElementById('breite').value;
    const h = document.getElementById('hoehe').value;
    if(!proj || !b || !h) return alert("Pflichtfelder fehlen!");

    const data = {
        proj, b, h,
        pos: document.getElementById('position').value || "Position",
        typ: document.getElementById('elemTyp').value,
        typL: document.getElementById('typL').value,
        typR: document.getElementById('typR').value,
        glas: document.getElementById('glasTyp').value,
        din: document.getElementById('dinRichtung').value,
        rolllo: document.getElementById('rollloArt').value,
        motor: document.getElementById('motorSeite').value,
        kabel: document.getElementById('kabelSeite').value,
        notizen: document.getElementById('notizen').value,
        id: editId || Date.now()
    };

    if(editId) {
        const idx = fensterListe.findIndex(f => f.id === editId);
        fensterListe[idx] = data;
    } else { fensterListe.push(data); }

    localStorage.setItem('FensterProDB_V12', JSON.stringify(fensterListe));
    resetForm(); render();
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
    document.getElementById('glasTyp').value = f.glas;
    document.getElementById('dinRichtung').value = f.din;
    document.getElementById('rollloArt').value = f.rolllo;
    document.getElementById('motorSeite').value = f.motor;
    document.getElementById('kabelSeite').value = f.kabel;
    document.getElementById('notizen').value = f.notizen;
    document.getElementById('add-btn').style.display = 'none';
    document.getElementById('update-btn').style.display = 'block';
    updateUI(); window.scrollTo({top: 0, behavior: 'smooth'});
}

function render() {
    const container = document.getElementById('fenster-liste');
    container.innerHTML = fensterListe.map(f => `
        <div class="list-item">
            <span><strong>${f.pos}</strong>: ${f.b}x${f.h}mm</span>
            <div class="actions">
                <span style="color:var(--ios-blue); font-weight:600;" onclick="edit(${f.id})">Edit</span>
                <span style="color:#FF3B30; margin-left:15px; font-weight:600;" onclick="remove(${f.id})">X</span>
            </div>
        </div>`).join('');
    document.getElementById('count').innerText = fensterListe.length;
    document.getElementById('btn-preview').style.display = fensterListe.length > 0 ? 'block' : 'none';
}

function remove(id) { if(confirm("Löschen?")) { fensterListe = fensterListe.filter(x => x.id !== id); localStorage.setItem('FensterProDB_V12', JSON.stringify(fensterListe)); render(); } }

function generateSVG(f) {
    const is2flg = f.typ.includes('Stulp');
    const isBT = f.typ.includes('Balkontür');
    const hasAufsatz = (f.rolllo === 'Aufsatzrollladen');
    const frameTop = hasAufsatz ? 80 : 0;
    const frameHeight = 400 - frameTop;

    let svg = `<svg viewBox="-110 -130 500 640" xmlns="http://www.w3.org/2000/svg" style="background:white;">
        <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#000" /></marker></defs>`;

    if(hasAufsatz) {
        svg += `<rect x="0" y="0" width="300" height="80" fill="#f5f5f5" stroke="#000" stroke-width="2" />
                <text x="150" y="35" text-anchor="middle" font-size="14" font-weight="bold">AUFSATZROLLLADEN</text>`;
        const motX = f.motor === 'Links' ? 35 : 265;
        const kabX = f.kabel === 'Links' ? 75 : 225;
        svg += `<circle cx="${motX}" cy="55" r="8" fill="blue" /> <text x="${motX}" y="72" text-anchor="middle" font-size="9" fill="blue" font-weight="bold">MOTOR</text>`;
        svg += `<circle cx="${kabX}" cy="55" r="8" fill="red" /> <text x="${kabX}" y="72" text-anchor="middle" font-size="9" fill="red" font-weight="bold">KABEL</text>`;
    }

    svg += `<rect x="0" y="${frameTop}" width="300" height="${frameHeight}" fill="none" stroke="#000" stroke-width="4" />`;

    // Maßketten (Nach rechts/innen verschoben für Safe Area)
    svg += `<line x1="0" y1="-90" x2="300" y2="-90" stroke="#000" marker-start="url(#arrow)" marker-end="url(#arrow)" />
            <text x="150" y="-105" text-anchor="middle" font-size="30" font-weight="bold">${f.b} mm</text>
            <line x1="-100" y1="10" x2="-100" y2="390" stroke="#000" marker-start="url(#arrow)" marker-end="url(#arrow)" />
            <text x="-115" y="200" text-anchor="middle" transform="rotate(-90, -115, 200)" font-size="30" font-weight="bold">${f.h} mm</text>`;

    const drawDIN = (x, w, typ, din) => {
        if(typ === 'Festverglast') return "";
        const hingeR = (din === 'Rechts');
        let res = `<polyline points="${hingeR?x+w-12:x+12},${frameTop+18} ${hingeR?x+12:x+w-12},${frameTop+(frameHeight/2)} ${hingeR?x+w-12:x+12},${382}" fill="none" stroke="#666" stroke-dasharray="12,6" />`;
        // Kipp-Symbol: SPITZE NACH OBEN
        if(typ === 'Dreh-Kipp') res += `<polyline points="${x+18},382 ${x+w/2},${frameTop+18} ${x+w-18},382" fill="none" stroke="#666" stroke-dasharray="12,6" />`;
        return res;
    };

    if(is2flg) {
        svg += `<line x1="150" y1="${frameTop}" x2="150" y2="400" stroke="#000" stroke-width="2" />`;
        svg += drawDIN(0, 150, f.typL, 'Rechts') + drawDIN(150, 150, f.typR, 'Links');
    } else { svg += drawDIN(0, 300, f.typL, f.din); }

    if(isBT) svg += `<line x1="0" y1="395" x2="300" y2="395" stroke="#000" stroke-width="1.5" />`;
    return svg + `</svg>`;
}

function showPreview() {
    document.getElementById('input-view').style.display = 'none';
    document.getElementById('preview-view').style.display = 'block';
    const proj = document.getElementById('projektName').value;
    let html = `<h2>Projekt: ${proj}</h2><p>Datum: ${new Date().toLocaleDateString()}</p><hr style="border:1.5px solid #000;">`;
    fensterListe.forEach(f => {
        html += `<div class="pdf-item">
            <div class="pdf-svg">${generateSVG(f)}</div>
            <div class="pdf-data">
                <h3>${f.pos}</h3>
                <p><strong>Gesamt-Außenmaß:</strong> ${f.b} x ${f.h} mm</p>
                <p><strong>Element-Typ:</strong> ${f.typ}</p>
                <p><strong>Anschlag:</strong> DIN ${f.din}</p>
                <p><strong>Flügel 1:</strong> ${f.typL}${is2flg(f)?' / <strong>Flügel 2:</strong> '+f.typR:''}</p>
                <p><strong>Glas:</strong> ${f.glas}</p>
                <p><strong>Rollladen:</strong> ${f.rolllo} ${f.rolllo!=='Kein Rollladen'?'<br> (Motor: '+f.motor+' / Kabelaustritt: '+f.kabel+')':''}</p>
                ${f.notizen ? `<div class="pdf-note"><strong>Anmerkung:</strong> ${f.notizen}</div>` : ''}
            </div>
        </div>`;
    });
    document.getElementById('pdf-content').innerHTML = html; window.scrollTo(0,0);
}
function is2flg(f) { return f.typ.includes('Stulp'); }
function hidePreview() { document.getElementById('preview-view').style.display = 'none'; document.getElementById('input-view').style.display = 'block'; }
function resetForm() { document.getElementById('position').value = ""; document.getElementById('breite').value = ""; document.getElementById('hoehe').value = ""; document.getElementById('notizen').value = ""; document.getElementById('add-btn').style.display = 'block'; document.getElementById('update-btn').style.display = 'none'; editId = null; }
document.getElementById('header-date').innerText = new Date().toLocaleDateString('de-DE');
render(); updateUI();