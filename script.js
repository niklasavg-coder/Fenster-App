function toggleUI() {
    const rolllo = document.getElementById('rollloTyp').value;
    document.getElementById('kabelBox').style.display = (rolllo === "ELEKTRO") ? "flex" : "none";
}

function editMode() {
    document.getElementById('input-view').style.display = 'block';
    document.getElementById('preview-view').style.display = 'none';
    window.scrollTo(0,0);
}

function generatePreview() {
    const b = document.getElementById('breite').value;
    const h = document.getElementById('hoehe').value;
    const projekt = document.getElementById('projektName').value || "Unbenannt";
    const pos = document.getElementById('position').value || "Keine Position";
    
    if(!b || !h) return alert("Bitte Breite und Höhe eingeben!");

    // Ansicht umschalten
    document.getElementById('input-view').style.display = 'none';
    document.getElementById('preview-view').style.display = 'block';

    // Kopfzeile füllen
    document.getElementById('pdfTitel').innerText = projekt;
    document.getElementById('pdfPos').innerText = "📍 " + pos;
    document.getElementById('pdfDatum').innerText = new Date().toLocaleDateString('de-DE');

    // SVG Skizze (Profi-Logik für BT = Balkontür)
    const typ = document.getElementById('elemTyp').value;
    let svg = `<svg viewBox="-50 -60 400 520" xmlns="http://www.w3.org/2000/svg" style="background:white;">
        <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#000" /></marker></defs>
        
        <rect x="0" y="0" width="300" height="400" stroke="#000" fill="none" stroke-width="3" />`;

    // Wenn Balkontür: Schwelle unten einzeichnen
    if (typ === "BT") {
        svg += `<line x1="0" y1="390" x2="300" y2="390" stroke="#000" stroke-width="1" />`;
    }

    // Maßketten
    svg += `<line x1="0" y1="-20" x2="300" y2="-20" stroke="#000" marker-start="url(#arrow)" marker-end="url(#arrow)" />
            <text x="150" y="-30" text-anchor="middle" font-size="14" font-weight="bold">${b} mm</text>
            <line x1="-25" y1="0" x2="-25" y2="400" stroke="#000" marker-start="url(#arrow)" marker-end="url(#arrow)" />
            <text x="-40" y="200" text-anchor="middle" transform="rotate(-90, -40, 200)" font-size="14" font-weight="bold">${h} mm</text>`;

    // Flügel-Skizze
    if (typ === "2") {
        svg += `<line x1="150" y1="0" x2="150" y2="400" stroke="#000" />
                <polyline points="0,0 150,200 0,400" fill="none" stroke="#666" stroke-dasharray="5,5" />
                <polyline points="300,0 150,200 300,400" fill="none" stroke="#666" stroke-dasharray="5,5" />`;
    } else {
        svg += `<polyline points="300,0 0,200 300,400" fill="none" stroke="#666" stroke-dasharray="5,5" />`;
    }

    svg += `</svg>`;
    document.getElementById('svgWrapper').innerHTML = svg;

    // Tabelle füllen
    document.getElementById('infoGrid').innerHTML = `
        <div class="info-item"><strong>Typ:</strong> ${typ === "BT" ? "Balkontür" : typ + "-flg. Fenster"}</div>
        <div class="info-item"><strong>Glas:</strong> ${document.getElementById('glasTyp').value}</div>
        <div class="info-item"><strong>Rollladen:</strong> ${document.getElementById('rollloTyp').value}</div>
        <div class="info-item"><strong>Maß:</strong> ${b} x ${h} mm</div>
    `;

    window.scrollTo(0,0);
}

function previewFoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('pdfImg').src = e.target.result;
            document.getElementById('fotoInPdf').style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    }
}