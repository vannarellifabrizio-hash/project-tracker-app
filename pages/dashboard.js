import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  getCollaboratori,
  getProgetti,
  getAttivita,
  getStatusCollaboratore,
  getUltimaAttivitaCollaboratore,
  filtraAttivita
} from '../utils/storage';
import { generaPDFTabellare, generaPDFEditoriale } from '../utils/pdfGenerator';

export default function Dashboard() {
  const router = useRouter();
  
  const [collaboratori, setCollaboratori] = useState([]);
  const [progetti, setProgetti] = useState([]);
  const [attivita, setAttivita] = useState([]);
  const [attivitaFiltrate, setAttivitaFiltrate] = useState([]);
  
  // Filtri
  const [filtroDataInizio, setFiltroDataInizio] = useState('');
  const [filtroDataFine, setFiltroDataFine] = useState('');
  const [filtroProgetto, setFiltroProgetto] = useState('');
  const [filtroCollaboratore, setFiltroCollaboratore] = useState('');
  const [filtriApplicati, setFiltriApplicati] = useState(false);
  
  // Espansione
  const [progettiEspansi, setProgettiEspansi] = useState({});

  useEffect(() => {
    caricaDati();
  }, []);

  const caricaDati = useCallback(() => {
    setCollaboratori(getCollaboratori());
    setProgetti(getProgetti());
    const tutteAttivita = getAttivita();
    setAttivita(tutteAttivita);
    setAttivitaFiltrate(tutteAttivita);
  }, []);

  // ===================================
  // FILTRI
  // ===================================
  const applicaFiltri = () => {
    const filtri = {
      dataInizio: filtroDataInizio,
      dataFine: filtroDataFine,
      progettoId: filtroProgetto,
      collaboratoreId: filtroCollaboratore
    };
    
    const risultato = filtraAttivita(filtri);
    setAttivitaFiltrate(risultato);
    setFiltriApplicati(true);
  };

  const resetFiltri = () => {
    setFiltroDataInizio('');
    setFiltroDataFine('');
    setFiltroProgetto('');
    setFiltroCollaboratore('');
    setAttivitaFiltrate(attivita);
    setFiltriApplicati(false);
  };

  const setUltimi7Giorni = () => {
    const oggi = new Date();
    const setteGiorniFa = new Date();
    setteGiorniFa.setDate(oggi.getDate() - 7);
    
    setFiltroDataInizio(setteGiorniFa.toISOString().split('T')[0]);
    setFiltroDataFine(oggi.toISOString().split('T')[0]);
  };

  // ===================================
  // EXPORT PDF
  // ===================================
  const esportaPDFTabellare = () => {
    generaPDFTabellare(attivitaFiltrate, progetti, collaboratori);
  };

  const esportaPDFEditoriale = () => {
    generaPDFEditoriale(attivitaFiltrate, progetti, collaboratori);
  };

  // ===================================
  // UTILITY
  // ===================================
  const toggleEspansione = (progettoId) => {
    setProgettiEspansi(prev => ({
      ...prev,
      [progettoId]: !prev[progettoId]
    }));
  };

  const getAttivitaPerProgetto = (progettoId) => {
    return attivitaFiltrate.filter(a => a.progettoId === progettoId)
      .sort((a, b) => new Date(b.dataInserimento) - new Date(a.dataInserimento));
  };

  const getCollaboratoriPerProgetto = (progettoId) => {
    const attivitaProgetto = attivitaFiltrate.filter(a => a.progettoId === progettoId);
    const collabIds = [...new Set(attivitaProgetto.map(a => a.collaboratoreId))];
    return collaboratori.filter(c => collabIds.includes(c.id));
  };

  const isProgettoTerminato = (progetto) => {
    if (!progetto.dataFine) return false;
    return new Date(progetto.dataFine) < new Date();
  };

  return (
    <div className="container">
      <div className="header">
        <h1>📊 Dashboard - Visione Totale</h1>
        <button className="logout-btn" onClick={() => router.push('/')}>
          Esci
        </button>
      </div>

      {/* STATUS COLLABORATORI */}
      <div className="card" style={{ background: '#f8fafc' }}>
        <h2 style={{ marginBottom: '16px' }}>👥 Status Collaboratori</h2>
        
        {collaboratori.length === 0 ? (
          <p style={{ color: '#64748b' }}>Nessun collaboratore presente</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {collaboratori.map(collab => {
              const ultimaAttivita = getUltimaAttivitaCollaboratore(collab.id);
              const status = getStatusCollaboratore(collab.id);
              
              return (
                <div
                  key={collab.id}
                  style={{
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <span
                    className={`status-indicator status-${status}`}
                  />
                  <div>
                    <div style={{ fontWeight: '500', color: collab.colore }}>
                      {collab.nome}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {ultimaAttivita 
                        ? `Ultima attività: ${new Date(ultimaAttivita.dataInserimento).toLocaleDateString('it-IT')}`
                        : 'Nessuna attività'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FILTRI */}
      <div className="filter-section">
        <h2 style={{ marginBottom: '16px' }}>🔍 Filtri di Ricerca</h2>
        
        <div className="filter-row">
          {/* Data Inizio */}
          <div className="input-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
            <label>Data Inizio</label>
            <input
              type="date"
              value={filtroDataInizio}
              onChange={(e) => setFiltroDataInizio(e.target.value)}
            />
          </div>

          {/* Data Fine */}
          <div className="input-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
            <label>Data Fine</label>
            <input
              type="date"
              value={filtroDataFine}
              onChange={(e) => setFiltroDataFine(e.target.value)}
            />
          </div>

          {/* Quick Filter: Ultimi 7 giorni */}
          <button
            className="btn btn-secondary"
            onClick={setUltimi7Giorni}
            style={{ alignSelf: 'flex-end' }}
          >
            📅 Ultimi 7 giorni
          </button>
        </div>

        <div className="filter-row" style={{ marginTop: '12px' }}>
          {/* Progetto */}
          <div className="input-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
            <label>Progetto</label>
            <select
              value={filtroProgetto}
              onChange={(e) => setFiltroProgetto(e.target.value)}
            >
              <option value="">Tutti i progetti</option>
              {progetti.map(p => (
                <option key={p.id} value={p.id}>{p.titolo}</option>
              ))}
            </select>
          </div>

          {/* Collaboratore */}
          <div className="input-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
            <label>Collaboratore</label>
            <select
              value={filtroCollaboratore}
              onChange={(e) => setFiltroCollaboratore(e.target.value)}
            >
              <option value="">Tutti i collaboratori</option>
              {collaboratori.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Pulsanti Azione */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button className="btn btn-primary" onClick={applicaFiltri}>
            🔍 Filtra Risultati
          </button>
          {filtriApplicati && (
            <button className="btn btn-secondary" onClick={resetFiltri}>
              ↺ Reset Filtri
            </button>
          )}
        </div>

        {filtriApplicati && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            background: '#dbeafe',
            borderRadius: '6px',
            color: '#1e40af'
          }}>
            ✓ Filtri applicati - {attivitaFiltrate.length} attività trovate
          </div>
        )}
      </div>

      {/* EXPORT PDF */}
      <div className="card" style={{ background: '#fef3c7' }}>
        <h2 style={{ marginBottom: '16px' }}>📄 Esporta in PDF</h2>
        <p style={{ marginBottom: '16px', color: '#92400e' }}>
          {filtriApplicati 
            ? 'L\'export rispetterà i filtri applicati sopra' 
            : 'Verranno esportate tutte le attività (nessun filtro attivo)'}
        </p>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={esportaPDFTabellare}>
            📊 Esporta PDF Tabellare
          </button>
          <button className="btn btn-success" onClick={esportaPDFEditoriale}>
            📖 Esporta PDF Editoriale
          </button>
        </div>
      </div>

      {/* PROGETTI */}
      <h2 style={{ marginTop: '30px', marginBottom: '20px' }}>📁 Progetti e Attività</h2>
      
      {progetti.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#64748b' }}>
            Nessun progetto presente
          </p>
        </div>
      ) : (
        progetti.map(progetto => {
          const attivitaProgetto = getAttivitaPerProgetto(progetto.id);
          const collaboratoriProgetto = getCollaboratoriPerProgetto(progetto.id);
          const isEspanso = progettiEspansi[progetto.id];
          const attivitaDaMostrare = isEspanso ? attivitaProgetto : attivitaProgetto.slice(0, 10);
          const isTerminato = isProgettoTerminato(progetto);
          
          return (
            <div key={progetto.id} className="project-card">
              {/* HEADER */}
              <div className="project-header">
                <div>
                  <h2>{progetto.titolo}</h2>
                  {progetto.sottotitolo && (
                    <p style={{ color: '#64748b', marginTop: '4px' }}>
                      {progetto.sottotitolo}
                    </p>
                  )}
                  
                  {/* RISORSE INTERESSATE */}
                  {collaboratoriProgetto.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <strong>Risorse interessate: </strong>
                      {collaboratoriProgetto.map((collab, index) => (
                        <span key={collab.id}>
                          <strong style={{ color: collab.colore }}>
                            {collab.nome}
                          </strong>
                          {index < collaboratoriProgetto.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  {/* DATE */}
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                    {progetto.dataInizio && (
                      <div>Inizio: {new Date(progetto.dataInizio).toLocaleDateString('it-IT')}</div>
                    )}
                    {progetto.dataFine && (
                      <div>Fine: {new Date(progetto.dataFine).toLocaleDateString('it-IT')}</div>
                    )}
                  </div>
                  
                  {/* STATUS */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'flex-end',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    <span
                      className={`status-indicator ${isTerminato ? 'status-red' : 'status-green'}`}
                    />
                    {isTerminato ? 'Terminato' : 'In Corso'}
                  </div>
                </div>
              </div>

              {/* ATTIVITÀ */}
              <h3 style={{ marginTop: '20px', marginBottom: '12px', fontSize: '16px' }}>
                📋 Attività ({attivitaProgetto.length})
              </h3>
              
              {attivitaProgetto.length === 0 ? (
                <p style={{ color: '#64748b', fontStyle: 'italic' }}>
                  Nessuna attività presente per questo progetto
                </p>
              ) : (
                <>
                  {attivitaDaMostrare.map(att => {
                    const collaboratore = collaboratori.find(c => c.id === att.collaboratoreId);
                    return (
                      <div key={att.id} className="activity-item">
                        <div>
                          <span 
                            style={{ 
                              fontWeight: 'bold', 
                              color: collaboratore?.colore || '#000'
                            }}
                          >
                            • {collaboratore?.nome || 'Sconosciuto'}
                          </span>
                          <span style={{ color: '#64748b', marginLeft: '12px', fontSize: '14px' }}>
                            {new Date(att.dataInserimento).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                        <p style={{ color: '#1e293b', marginTop: '4px' }}>{att.testo}</p>
                      </div>
                    );
                  })}
                  
                  {attivitaProgetto.length > 10 && (
                    <button
                      className="btn btn-secondary"
                      style={{ width: '100%', marginTop: '12px' }}
                      onClick={() => toggleEspansione(progetto.id)}
                    >
                      {isEspanso 
                        ? `⬆️ Mostra solo le prime 10 attività` 
                        : `⬇️ Mostra tutte le attività (${attivitaProgetto.length})`}
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
