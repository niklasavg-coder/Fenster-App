function skizzeErstellen() {
    const breite = document.getElementById('breite').value;
    const hoehe = document.getElementById('hoehe').value;
    const typ = document.getElementById('typ').value;
    const richtung = document.getElementById('richtung').value;

    if (!breite || !hoehe) {
        alert("Bitte Breite und Höhe eingeben.");
        return;
    }

    // Wir bauen das SVG dynamisch zusammen.
    // Wir nutzen eine feste "Leinwand" von 300x400 Einheiten für die Zeichnung.
    let svgContent = `
        <svg viewBox="-50 -50 400 500" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#000" />
                </marker>
            </defs>

            <rect x="0" y="0" width="300" height="400" class="fenster-rahmen" />

            <line x1="0" y1="-20" x2="300" y2="-20" class="masslinie" marker-start="url(#arrow)" marker-end="url(#arrow)" />
            <line x1="0" y1="-25" x2="0" y2="0" class="masslinie" /> <line x1="300" y1="-25" x2="300" y2="0" class="masslinie" /> <text x="150" y="-30" text-anchor="middle" class="mass-text">${breite} mm</text>

            <line x1="-20" y1="0" x2="-20" y2="400" class="masslinie" marker-start="url(#arrow)" marker-end="url(#arrow)" />
            <line x1="-25" y1="0" x2="0" y2="0" class="masslinie" /> <line x1="-25" y1="400" x2="0" y2="400" class="masslinie" /> <text x="-30" y="200" text-anchor="middle" transform="rotate(-90, -30, 200)" class="mass-text">${hoehe} mm</text>

            ${generiereOeffnungsSymbol(typ, richtung)}

        </svg>
    `;

    // SVG in den Container packen und anzeigen
    document.getElementById('svgWrapper').innerHTML = svgContent;
    document.getElementById('skizzenContainer').style.display = 'block';
}

// Hilfsfunktion: Entscheidet, welche Dreiecke gezeichnet werden müssen
function generiereOeffnungsSymbol(typ, richtung) {
    if (typ === 'FEST') {
        // Festverglasung bekommt oft ein einfaches Kreuz oder gar nichts.
        // Wir lassen es erstmal leer für eine saubere Ansicht.
        return ''; 
    }

    let pfade = '';
    // Koordinaten für das 300x400 Rechteck
    const top = 0; const bottom = 400;
    const left = 0; const right = 300;
    const midX = 150; const midY = 200;

    // Dreh-Symbol (Das Dreieck, das die horizontale Öffnung anzeigt)
    if (richtung === 'L') {
        // DIN Links: Bänder links, Griff rechts. Spitze zeigt nach rechts.
        // Dreieck von Links-Oben -> Rechts-Mitte -> Links-Unten
        pfade += `<polygon points="${left},${top} ${right},${midY} ${left},${bottom}" class="oeffnungs-symbol"/>`;
    } else {
        // DIN Rechts: Bänder rechts, Griff links. Spitze zeigt nach links.
        // Dreieck von Rechts-Oben -> Links-Mitte -> Rechts-Unten
        pfade += `<polygon points="${right},${top} ${left},${midY} ${right},${bottom}" class="oeffnungs-symbol"/>`;
    }

    // Kipp-Symbol (Das zusätzliche untere Dreieck bei DK)
    if (typ === 'DK') {
        // Spitze zeigt immer nach unten, Basis ist oben
        // Dreieck von Links-Oben -> Mitte-Unten -> Rechts-Oben
        pfade += `<polygon points="${left},${top} ${midX},${bottom} ${right},${top}" class="oeffnungs-symbol"/>`;
    }

    return pfade;
}