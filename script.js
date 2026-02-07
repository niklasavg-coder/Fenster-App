let fensterListe = JSON.parse(localStorage.getItem('FensterProDB_v7')) || [];
let editId = null;

function updateUI() {
    const elem = document.getElementById('elemTyp').value;
    const rolllo = document.getElementById('rollloArt').value;
    
    document.getElementById('row-din').style.display = (elem === '1' || elem === 'BT') ? 'flex' : 'none';
    document.getElementById('row-griff2').style.display = (elem === '2' || elem === '2BT') ? 'flex' : 'none';
    document.getElementById('motor-config').style.display = (rolllo !== 'KEIN') ? 'block' : 'none';
}

function saveItem() {
    const proj = document.getElementById('projektName').value;
    const b = document.getElementById('breite').value;
    const h = document.getElementById('hoehe').value;
    
    if(!proj || !b || !h) return alert("Projekt, Breite und Höhe sind Pflicht!");

    const data = {
        proj, b, h,
        pos: document.getElementById('position').value || "Fenster",
        typ: document.getElementById('elemTyp').value,
        glas: document.getElementById('glasTyp').value,
        din: document.getElementById('dinRichtung').value,
        griff2: document.getElementById('griffSitz2').value,
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

    localStorage.setItem('FensterProDB_v7', JSON.stringify(fensterListe));
    resetForm();
    render();
}

function resetForm() {
    document.getElementById('position').value = "";
    document.getElementById('breite').value = "";
    document.getElementById('hoehe').value = "";
    document.getElementById('notizen').value = "";
    document.getElementById('add-btn').style.display = 'block';
    document.getElementById('update-btn').style.display = 'none';
    editId = null;
}

function edit(id) {
    const f = fensterListe.find(x => x.id === id);
    editId = id;
    document.getElementById('position').value = f.pos;
    document.getElementById('breite').value = f.b;
    document.getElementById('hoehe').value = f.h;
    document.getElementById('elemTyp').value = f.typ;
    document.getElementById('glasTyp').value = f.glas;
    document.getElementById('dinRichtung').value = f.din;
    document.getElementById('griffSitz2').value = f.griff2;
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
    if(!confirm("Löschen?")) return;
    fensterListe = fensterListe.filter(x => x.id !== id);
    localStorage.setItem('FensterProDB_v7', JSON.stringify(fensterListe));
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

function clearAll() { if(confirm("Gesamtes Projekt löschen?")) { fensterListe = []; localStorage.removeItem('FensterProDB_v7'); render(); } }

function generateSVG(f) {
    const is2flg = (f.typ === '2' || f.typ === '2BT');
    const isBT = (f.typ === 'BT' || f.typ === '2BT');
    const hasAufsatz = (f.rolllo === 'AUFSATZ');
    const boxHeight = 210; // Standard Aufsatzkasten-Höhe

    let svg = `<svg viewBox="-80 -120 450 600" xmlns="http://www.w3.org/2000/svg" style="background:white;">
        <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#000" /></marker></defs>`;

    if(hasAufsatz) {
        svg += `<rect x="0" y="-50" width="300" height="50" fill="#eee" stroke="#000" stroke-width="2" />
                <text x="150" y="-32" text-anchor="middle" font-size="12" font-weight="bold">AUFSATZROLLO</text>`;
        // Markierung auf dem Kasten
        const motX = f.motor === 'L' ? 20 : 280;
        const kabX = f.kabel === 'L' ? 40 : 260;
        svg += `<circle cx="${motX}" cy="-25" r="5" fill="blue" /> <text x="${motX}" y="-10" text-anchor="middle" font-size="8" fill="blue">MOTOR</text>`;
        svg += `<circle cx="${kabX}" cy="-25" r="5" fill="red" /> <text x="${kabX}" y="-10" text-anchor="middle" font-size="8" fill="red">KABEL</text>`;
    }

    svg += `<rect x="0" y="0" width="300" height="400" fill="none" stroke="#000" stroke-width="4" />`;

    // Maßketten
    svg += `<line x1="10" y1="-70" x2="290" y2="-70" stroke="#000" marker-start="url(#arrow)" marker-end="url(#arrow)" />
            <text x="150" y="-80" text-anchor="middle" font-size="22" font-weight="bold">${f.b} mm</text>
            <line x1="-60" y1="10" x2="-60" y2="390" stroke="#000" marker-start="url(#arrow)" marker-end="url(#arrow)" />
            <text x="-70" y="200" text-anchor="middle" transform="rotate(-90, -70, 200)" font-size="22" font-weight="bold">${f.h} mm</text>`;

    const drawDIN = (x, w, side) => {
        // Dreh-Symbol
        let res = `<polyline points="${side==='R'?x+w-5:x+5},10 ${side==='R'?x+5:x+w-5},200 ${side==='R'?x+w-5:x+5},390" fill="none" stroke="#666" stroke-dasharray="8,4" />`;
        // Kipp-Symbol (Spitze nach OBEN)
        res += `<polyline points="${x+5},390 ${x+w/2},10 ${x+w-5},390" fill="none" stroke="#666" stroke-dasharray="8,4" />`;
        return res;
    };

    if(is2flg) {
        svg += `<line x1="150" y1="0" x2="150" y2="400" stroke="#000" stroke-width="2" />`;
        svg += drawDIN(0, 150, f.griff2 === 'L' ? 'R' : 'L'); 
        svg += drawDIN(150, 150, f.griff2 === 'R' ? 'L' : 'R');
    } else {
        svg += drawDIN(0, 300, f.din);
    }

    if(isBT) svg += `<line x1="0" y1="395" x2="300" y2="395" stroke="#000" stroke-width="1.5" />`;

    return svg + `</svg>`;
}

function showPreview() {
    document.getElementById('input-view').style.display = 'none';
    document.getElementById('preview-view').style.display = 'block';
    const proj = document.getElementById('projektName').value;
    
    let html = `<h2>Projekt: ${proj}</h2><p>Datum: ${new Date().toLocaleDateString()}</p><hr>`;
    fensterListe.forEach(f => {
        html += `<div class="pdf-item">
            <div class="pdf-svg">${generateSVG(f)}</div>
            <div class="pdf-data">
                <h3>${f.pos}</h3>
                <p><strong>Außenmaß:</strong> ${f.b} x ${f.h} mm</p>
                <p><strong>Typ:</strong> ${f.typ} | <strong>Glas:</strong> ${f.glas}</p>
                <p><strong>Rollo:</strong> ${f.rolllo} (Mot:${f.motor}/Kab:${f.kabel})</p>
                ${f.notizen ? `<div class="pdf-note"><strong>Notiz:</strong> ${f.notizen}</div>` : ''}
            </div>
        </div>`;
    });
    document.getElementById('pdf-content').innerHTML = html;
    window.scrollTo(0,0);
}

function hidePreview() { document.getElementById('preview-view').style.display = 'none'; document.getElementById('input-view').style.display = 'block'; }
document.getElementById('header-date').innerText = new Date().toLocaleDateString('de-DE');
render(); updateUI();