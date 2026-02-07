let fensterListe = JSON.parse(localStorage.getItem('FensterProDB_V10')) || [];
let editId = null;

function updateUI() {
    const elem = document.getElementById('elemTyp').value;
    const rolllo = document.getElementById('rollloArt').value;
    document.getElementById('row-f2').style.display = (elem === '2' || elem === '2BT') ? 'flex' : 'none';
    document.getElementById('row-din').style.display = (elem === '1' || elem === 'BT') ? 'flex' : 'none';
    document.getElementById('motor-config').style.display = (rolllo !== 'KEIN') ? 'block' : 'none';
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

    localStorage.setItem('FensterProDB_V10', JSON.stringify(fensterListe));
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
    document.getElementById('btn-clear').style.display = fensterListe.length > 0 ? 'block' : 'none';
}

function remove(id) { if(confirm("Löschen?")) { fensterListe = fensterListe.filter(x => x.id !== id); localStorage.setItem('FensterProDB_V10', JSON.stringify(fensterListe)); render(); } }
function clearAll() { if(confirm("Gesamtes Projekt löschen?")) { fensterListe = []; localStorage.removeItem('FensterProDB_V10'); render(); } }

function generateSVG(f) {
    const is2flg = (f.typ === '2' || f.typ === '2BT');
    const isBT = (f.typ === 'BT' || f.typ === '2BT');
    const hasAufsatz = (f.rolllo === 'AUFSATZ');
    
    // SVG Skalierung
    const frameTop = hasAufsatz ? 70 : 0;
    const frameHeight = 400 - frameTop;

    let svg = `<svg viewBox="-100 -120 480 620" xmlns="http://www.w3.org/2000/svg" style="background:white;">
        <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#000" /></marker></defs>`;

    if(hasAufsatz) {
        svg += `<rect x="0" y="0" width="300" height="70" fill="#f0f0f0" stroke="#000" stroke-width="2" />
                <text x="150" y="30" text-anchor="middle" font-size="12" font-weight="bold">AUFSATZROLLO</text>`;
        // Markierung auf dem Kasten
        const motX = f.motor === 'L' ? 30 : 270;
        const kabX = f.kabel === 'L' ? 60 : 240;
        svg += `<circle cx="${motX}" cy="50" r="7" fill="blue" /> <text x="${motX}" y="65" text-anchor="middle" font-size="9" fill="blue">MOTOR</text>`;
        svg += `<circle cx="${kabX}" cy="50" r="7" fill="red" /> <text x="${kabX}" y="65" text-anchor="middle" font-size="9" fill="red">KABEL</text>`;
    }

    svg += `<rect x="0" y="${frameTop}" width="300" height="${frameHeight}" fill="none" stroke="#000" stroke-width="4" />`;

    // Maßketten (Gesamtmaß inkl. Rollo)
    svg += `<line x1="0" y1="-80" x2="300" y2="-80" stroke="#000" marker-start="url(#arrow)" marker-end="url(#arrow)" />
            <text x="150" y="-95" text-anchor="middle" font-size="28" font-weight="bold">${f.b} mm</text>
            <line x1="-85" y1="5" x2="-85" y2="395" stroke="#000" marker-start="url(#arrow)" marker-end="url(#arrow)" />
            <text x="-95" y="200" text-anchor="middle" transform="rotate(-90, -95, 200)" font-size="28" font-weight="bold">${f.h} mm</text>`;

    const drawDIN = (x, w, typ, side) => {
        if(typ === 'FEST') return "";
        const hingeR = (side === 'R'); // DIN R: Bänder Rechts, Griff Links
        // Dreh-Symbol
        let res = `<polyline points="${hingeR?x+w-10:x+10},${frameTop+15} ${hingeR?x+10:x+w-10},${frameTop+(frameHeight/2)} ${hingeR?x+w-10:x+10},${385}" fill="none" stroke="#666" stroke-dasharray="10,5" />`;
        // Kipp-Symbol: SPITZE NACH OBEN (DIN Konform)
        if(typ === 'DK') res += `<polyline points="${x+15},385 ${x+w/2},${frameTop+15} ${x+w-15},385" fill="none" stroke="#666" stroke-dasharray="10,5" />`;
        return res;
    };

    if(is2flg) {
        svg += `<line x1="150" y1="${frameTop}" x2="150" y2="400" stroke="#000" stroke-width="2" />`;
        svg += drawDIN(0, 150, f.typL, 'R') + drawDIN(150, 150, f.typR, 'L');
    } else {
        svg += drawDIN(0, 300, f.typL, f.din);
    }

    if(isBT) svg += `<line x1="0" y1="395" x2="300" y2="395" stroke="#000" stroke-width="1.5" />`;
    return svg + `</svg>`;
}

function showPreview() {
    document.getElementById('input-view').style.display = 'none';
    document.getElementById('preview-view').style.display = 'block';
    const proj = document.getElementById('projektName').value;
    let html = `<h2>Projekt: ${proj}</h2><p>Erstellt: ${new Date().toLocaleDateString()}</p><hr style="border:1px solid #000;">`;
    fensterListe.forEach(f => {
        html += `<div class="pdf-item">
            <div class="pdf-svg">${generateSVG(f)}</div>
            <div class="pdf-data">
                <h3>${f.pos}</h3>
                <p><strong>Außenmaß:</strong> ${f.b} x ${f.h} mm (inkl. Rollo)</p>
                <p><strong>Glas:</strong> ${f.glas} | <strong>Typ:</strong> ${f.typ}</p>
                <p><strong>Rollo:</strong> ${f.rolllo} ${f.rolllo!=='KEIN'?'(Mot:'+f.motor+'/Kab:'+f.kabel+')':''}</p>
                ${f.notizen ? `<div class="pdf-note">${f.notizen}</div>` : ''}
            </div>
        </div>`;
    });
    document.getElementById('pdf-content').innerHTML = html; window.scrollTo(0,0);
}

function hidePreview() { document.getElementById('preview-view').style.display = 'none'; document.getElementById('input-view').style.display = 'block'; }
function resetForm() { document.getElementById('position').value = ""; document.getElementById('breite').value = ""; document.getElementById('hoehe').value = ""; document.getElementById('notizen').value = ""; document.getElementById('add-btn').style.display = 'block'; document.getElementById('update-btn').style.display = 'none'; editId = null; }
document.getElementById('header-date').innerText = new Date().toLocaleDateString('de-DE');
render(); updateUI();