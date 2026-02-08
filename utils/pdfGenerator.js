import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ===================================
// PDF TABELLARE (con celle unite)
// ===================================
export const generaPDFTabellare = (attivita, progetti, collaboratori) => {
  const doc = new jsPDF();
  
  // Titolo
  doc.setFontSize(18);
  doc.text('Report Attività - Vista Tabellare', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Generato il: ${new Date().toLocaleDateString('it-IT')}`, 14, 28);
  
  // Prepara i dati raggruppati per progetto
  const datiPerProgetto = progetti.map(progetto => {
    const attivitaProgetto = attivita.filter(a => a.progetto_id === progetto.id);
    
    // Raggruppa per collaboratore
    const attivitaPerCollaboratore = {};
    attivitaProgetto.forEach(att => {
      if (!attivitaPerCollaboratore[att.collaboratore_id]) {
        attivitaPerCollaboratore[att.collaboratore_id] = [];
      }
      attivitaPerCollaboratore[att.collaboratore_id].push(att);
    });
    
    return {
      progetto,
      attivitaPerCollaboratore
    };
  }).filter(item => Object.keys(item.attivitaPerCollaboratore).length > 0);
  
  // Crea le righe della tabella
  const righe = [];
  
  datiPerProgetto.forEach(({ progetto, attivitaPerCollaboratore }) => {
    const collaboratoriIds = Object.keys(attivitaPerCollaboratore);
    
    collaboratoriIds.forEach(collabId => {
      const collaboratore = collaboratori.find(c => c.id === collabId);
      const attivitaCollab = attivitaPerCollaboratore[collabId];
      
      if (attivitaCollab.length === 1) {
        // Una sola attività: riga normale
        righe.push([
          progetto.titolo,
          attivitaCollab[0].testo,
          collaboratore?.nome || 'Sconosciuto'
        ]);
      } else {
        // Più attività: prima riga con nome collaboratore
        righe.push([
          progetto.titolo,
          attivitaCollab[0].testo,
          collaboratore?.nome || 'Sconosciuto'
        ]);
        
        // Righe successive senza ripetere il nome (cella vuota)
        for (let i = 1; i < attivitaCollab.length; i++) {
          righe.push([
            '', // Progetto vuoto se stesso progetto
            attivitaCollab[i].testo,
            '' // Collaboratore vuoto (merge-like)
          ]);
        }
      }
    });
  });
  
  // Genera la tabella
  doc.autoTable({
    startY: 35,
    head: [['PROGETTO', 'ATTIVITÀ SVOLTE', 'COLLABORATORI']],
    body: righe,
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 90 },
      2: { cellWidth: 40 }
    },
    didDrawCell: (data) => {
      // Logica per "merge-like" visuale (bordi più sottili per celle vuote)
      if (data.cell.raw === '' && data.column.index !== 1) {
        data.cell.styles.lineWidth = 0.1;
        data.cell.styles.lineColor = [200, 200, 200];
      }
    }
  });
  
  // Salva il PDF
  doc.save(`Report_Tabellare_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ===================================
// PDF EDITORIALE (formato leggibile)
// ===================================
export const generaPDFEditoriale = (attivita, progetti, collaboratori) => {
  const doc = new jsPDF();
  let currentY = 20;
  
  // Titolo principale
  doc.setFontSize(18);
  doc.text('Report Attività - Vista Editoriale', 14, currentY);
  currentY += 8;
  
  doc.setFontSize(10);
  doc.text(`Generato il: ${new Date().toLocaleDateString('it-IT')}`, 14, currentY);
  currentY += 15;
  
  // Per ogni progetto
  progetti.forEach(progetto => {
    const attivitaProgetto = attivita.filter(a => a.progetto_id === progetto.id);
    
    if (attivitaProgetto.length === 0) return;
    
    // Controlla se serve nuova pagina
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }
    
    // Titolo progetto
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(progetto.titolo, 14, currentY);
    currentY += 6;
    
    if (progetto.sottotitolo) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'italic');
      doc.text(progetto.sottotitolo, 14, currentY);
      currentY += 6;
    }
    
    // Date
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    let dateText = '';
    if (progetto.data_inizio) {
      dateText += `Inizio: ${new Date(progetto.data_inizio).toLocaleDateString('it-IT')}`;
    }
    if (progetto.data_fine) {
      dateText += ` | Fine: ${new Date(progetto.data_fine).toLocaleDateString('it-IT')}`;
    }
    if (dateText) {
      doc.text(dateText, 14, currentY);
      currentY += 8;
    } else {
      currentY += 2;
    }
    
    // Raggruppa attività per collaboratore
    const attivitaPerCollaboratore = {};
    attivitaProgetto.forEach(att => {
      if (!attivitaPerCollaboratore[att.collaboratore_id]) {
        attivitaPerCollaboratore[att.collaboratore_id] = [];
      }
      attivitaPerCollaboratore[att.collaboratore_id].push(att);
    });
    
    // Per ogni collaboratore
    Object.keys(attivitaPerCollaboratore).forEach(collabId => {
      const collaboratore = collaboratori.find(c => c.id === collabId);
      const attivitaCollab = attivitaPerCollaboratore[collabId];
      
      // Ordina per data
      attivitaCollab.sort((a, b) => new Date(b.data_inserimento) - new Date(a.data_inserimento));
      
      // Nome collaboratore
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`${collaboratore?.nome || 'Sconosciuto'}:`, 18, currentY);
      currentY += 6;
      
      // Attività del collaboratore
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      
      attivitaCollab.forEach(att => {
        // Controlla nuova pagina
        if (currentY > 275) {
          doc.addPage();
          currentY = 20;
        }
        
        // Data + Testo
        const dataStr = new Date(att.data_inserimento).toLocaleDateString('it-IT');
        const testoCompleto = `• [${dataStr}] ${att.testo}`;
        
        // Split testo lungo su più righe
        const righeTestoSplittato = doc.splitTextToSize(testoCompleto, 175);
        
        righeTestoSplittato.forEach(riga => {
          if (currentY > 275) {
            doc.addPage();
            currentY = 20;
          }
          doc.text(riga, 22, currentY);
          currentY += 5;
        });
        
        currentY += 2; // Spazio tra attività
      });
      
      currentY += 4; // Spazio tra collaboratori
    });
    
    // Linea separatore tra progetti
    currentY += 6;
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    } else {
      doc.setDrawColor(200, 200, 200);
      doc.line(14, currentY, 196, currentY);
      currentY += 10;
    }
  });
  
  // Salva il PDF
  doc.save(`Report_Editoriale_${new Date().toISOString().split('T')[0]}.pdf`);
};
