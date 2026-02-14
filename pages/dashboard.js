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
  const [statusCollaboratori, setStatusCollaboratori] = useState({});
  const [ultimaAttivitaCollaboratori, setUltimaAttivitaCollaboratori] = useState({});
  
  const [filtroDataInizio, setFiltroDataInizio] = useState('');
  const [filtroDataFine, setFiltroDataFine] = useState('');
  const [filtroProgetto, setFiltroProgetto] = useState('');
  const [filtroCollaboratore, setFiltroCollaboratore] = useState('');
  const [filtriApplicati, setFiltriApplicati] = useState(false);
  const [collaboratoreSelezionato, setCollaboratoreSelezionato] = useState(null);
  
  const [progettiEspansi, setProgettiEspansi] = useState({});

  const coloriProgetti = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  ];

  useEffect(() => {
    caricaDati();
  }, []);

  const caricaDati = useCallback(async () => {
    const collab = await getCollaboratori();
    const prog = await getProgetti();
    const tutteAttivita = await getAttivita();
    
    setCollaboratori(collab || []);
    setProgetti(prog || []);
    setAttivita(tutteAttivita || []);
    setAttivitaFiltrate(tutteAttivita || []);
    
    const statusMap = {};
    const ultimaAttivitaMap = {};
    for (const c of (collab || [])) {
      const status = await getStatusCollaboratore(c.id);
      const ultima = await getUltimaAttivitaCollaboratore(c.id);
      statusMap[c.id] = status;
      ultimaAttivitaMap[c.id] = ultima;
    }
    setStatusCollaboratori(statusMap);
    setUltimaAttivitaCollaboratori(ultimaAttivitaMap);
  }, []);

  const filtraPerCollaboratore = async (collaboratoreId) => {
    const collaboratore = collaboratori.find(c => c.id === collaboratoreId);
    setCollaboratoreSelezionato(collaboratore);
    setFiltroCollaboratore(collaboratoreId);
    setFiltroProgetto('');
    setFiltroDataInizio('');
    setFiltroDataFine('');
    
    const risultato = await filtraAttivita({ collaboratoreId });
    setAttivitaFiltrate(risultato || []);
    setFiltriApplicati(true);
  };

  const applicaFiltri = async () => {
    const filtri = {
      dataInizio: filtroDataInizio,
      dataFine: filtroDataFine,
      progettoId: filtroProgetto,
      collaboratoreId: filtroCollaboratore
    };
    
    const risultato = await filtraAttivita(filtri);
    setAttivitaFiltrate(risultato || []);
    setFiltriApplicati(true);
    setCollaboratoreSelezionato(null);
  };

  const resetFiltri = () => {
    setFiltroDataInizio('');
    setFiltroDataFine('');
    setFiltroProgetto('');
    setFiltroCollaboratore('');
    setAttivitaFiltrate(attivita);
    setFiltriApplicati(false);
    setCollaboratoreSelezionato(null);
  };

  const setUltimi7Giorni = () => {
    const oggi = new Date();
    const setteGiorniFa = new Date();
    setteGiorniFa.setDate(oggi.getDate() - 7);
    
    setFiltroDataInizio(setteGiorniFa.toISOString().split('T')[0]);
    setFiltroDataFine(oggi.toISOString().split('T')[0]);
  };

  const esportaPDFTabellare = () => {
    generaPDFTabellare(attivitaFiltrate, progetti, collaboratori);
  };

  const esportaPDFEditoriale = () => {
    generaPDFEditoriale(attivitaFiltrate, progetti, collaboratori);
  };

  const toggleEspansione = (progettoId) => {
    setProgettiEspansi(prev => ({
      ...prev,
      [progettoId]: !prev[progettoId]
    }));
  };

  const getAttivitaPerProgetto = (progettoId) => {
    return attivitaFiltrate.filter(a => a.progetto_id === progettoId)
      .sort((a, b) => new Date(b.data_inserimento) - new Date(a.data_inserimento));
  };

  const getCollaboratoriPerProgetto = (progettoId) => {
    const attivitaProgetto = attivitaFiltrate.filter(a => a.progetto_id === progettoId);
    const collabIds = [...new Set(attivitaProgetto.map(a => a.collaboratore_id))];
    return collaboratori.filter(c => collabIds.includes(c.id));
  };

  const isProgettoTerminato = (progetto) => {
    if (!progetto.data_fine) return false;
    return new Date(progetto.data_fine) < new Date();
  };

  const progettiFiltrati = filtroProgetto 
    ? progetti.filter(p => p.id === filtroProgetto)
    : progetti;

  return (
    <div className="container">
      <div className="header" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <h1>📊 Dashboard - Visione Totale</h1>
        <button 
          className="logout-btn" 
          style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
          onClick={() => router.push('/')}
        >
          Esci
        </button>
      </div>

      {/* STATUS COLLABORATORI - COMPATTI */}
      <div className="card" style={{ background: '#ffffff', border: '2px solid #e5e7eb' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            👥 Status Collaboratori
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
            💡 Clicca su un collaboratore per vedere tutte le sue attività
          </p>
        </div>
        
        {collaboratori.length === 0 ? (
          <p style={{ color: '#64748b' }}>Nessun collaboratore presente</p>
        ) : (
          <div style={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            {collaboratori.map(collab => {
              const status = statusCollaboratori[collab.id] || 'red';
              const ultimaAtt = ultimaAttivitaCollaboratori[collab.id];
              const isSelezionato = collaboratoreSelezionato?.id === collab.id;
              
              return (
                <div
                  key={collab.id}
                  onClick={() => filtraPerCollaboratore(collab.id)}
                  style={{
                    padding: '10px 14px',
                    border: isSelezionato ? '2px solid #2563eb' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    background: isSelezionato ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isSelezionato ? '0 2px 8px rgba(37, 99, 235, 0.2)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    minWidth: '160px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelezionato) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelezionato) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <span 
                    className={`status-indicator status-${status}`}
                    style={{ width: '12px', height: '12px', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: '600', 
                      color: collab.colore,
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {collab.nome}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#64748b'
                    }}>
                      {ultimaAtt 
                        ? new Date(ultimaAtt.data_inserimento).toLocaleDateString('it-IT')
                        : 'Nessuna att.'
                      }
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
        
        {collaboratoreSelezionato && (
          <div style={{ 
            padding: '12px 16px',
            background: '#dbeafe',
            border: '2px solid #2563eb',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: '#1e40af', fontWeight: '500' }}>
              🔎 Visualizzando attività di: <strong>{collaboratoreSelezionato.nome}</strong>
            </span>
            <button 
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '14px' }}
              onClick={resetFiltri}
            >
              ✕ Rimuovi filtro
            </button>
          </div>
        )}
        
        <div className="filter-row">
          <div className="input-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
            <label>📅 Data Inizio</label>
            <input
              type="date"
              value={filtroDataInizio}
              onChange={(e) => setFiltroDataInizio(e.target.value)}
            />
          </div>

          <div className="input-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
            <label>📅 Data Fine</label>
            <input
              type="date"
              value={filtroDataFine}
              onChange={(e) => setFiltroDataFine(e.target.value)}
            />
          </div>

          <button
            className="btn btn-secondary"
            onClick={setUltimi7Giorni}
            style={{ alignSelf: 'flex-end' }}
          >
            📅 Ultimi 7 giorni
          </button>
        </div>

        <div className="filter-row" style={{ marginTop: '12px' }}>
          <div className="input-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
            <label>📁 Progetto</label>
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

          <div className="input-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
            <label>👤 Collaboratore</label>
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

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={applicaFiltri}>
            🔍 Filtra Risultati
          </button>
          {filtriApplicati && (
            <button className="btn btn-secondary" onClick={resetFiltri}>
              ↺ Reset Filtri
            </button>
          )}
          {/* PULSANTI PDF MINIMALISTI */}
          <button className="btn btn-primary" onClick={esportaPDFTabellare}>
            📊 PDF Tabellare
          </button>
          <button className="btn btn-success" onClick={esportaPDFEditoriale}>
            📖 PDF Editoriale
          </button>
        </div>

        {filtriApplicati && !collaboratoreSelezionato && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            background: '#dbeafe',
            borderRadius: '6px',
            color: '#1e40af'
          }}>
            ✓ Filtri applicati - {attivitaFiltrate.length} attività trovate
            {filtroProgetto && ' | ' + (filtriApplicati ? 'L\'export PDF rispetterà i filtri' : '')}
          </div>
        )}
      </div>

      {/* PROGETTI */}
      <h2 style={{ marginTop: '30px', marginBottom: '20px' }}>📁 Progetti e Attività</h2>
      
      {progettiFiltrati.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#64748b' }}>
            {filtroProgetto ? 'Nessuna attività per questo progetto' : 'Nessun progetto presente'}
          </p>
        </div>
      ) : (
        progettiFiltrati.map((progetto, index) => {
          const attivitaProgetto = getAttivitaPerProgetto(progetto.id);
          const collaboratoriProgetto = getCollaboratoriPerProgetto(progetto.id);
          const isEspanso = progettiEspansi[progetto.id];
          const attivitaDaMostrare = isEspanso ? attivitaProgetto : attivitaProgetto.slice(0, 10);
          const isTerminato = isProgettoTerminato(progetto);
          const coloreProgetto = coloriProgetti[index % coloriProgetti.length];
          
          return (
            <div key={progetto.id} style={{ marginBottom: '24px' }}>
              <div style={{
                background: coloreProgetto,
                padding: '20px',
                borderRadius: '12px 12px 0 0',
                color: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '24px', color: 'white' }}>{progetto.titolo}</h2>
                    {progetto.sottotitolo && (
                      <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: '15px' }}>
                        {progetto.sottotitolo}
                      </p>
                    )}
                  </div>
                  <div style={{
                    background: isTerminato ? '#ef4444' : '#22c55e',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {isTerminato ? '🔴 Terminato' : '🟢 In Corso'}
                  </div>
                </div>
                
                <div style={{ 
                  marginTop: '16px',
                  display: 'flex',
                  gap: '24px',
                  fontSize: '14px',
                  opacity: 0.95,
                  flexWrap: 'wrap'
                }}>
                  {collaboratoriProgetto.length > 0 && (
                    <div>
                      <strong>👥 Risorse: </strong>
                      {collaboratoriProgetto.map((collab, i) => (
                        <span key={collab.id}>
                          {collab.nome}
                          {i < collaboratoriProgetto.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  )}
                  <div>
                    <strong>📋 {attivitaProgetto.length} attività</strong>
                  </div>
                  {(progetto.data_inizio || progetto.data_fine) && (
                    <div>
                      📅 {progetto.data_inizio && new Date(progetto.data_inizio).toLocaleDateString('it-IT')}
                      {progetto.data_inizio && progetto.data_fine && ' - '}
                      {progetto.data_fine && new Date(progetto.data_fine).toLocaleDateString('it-IT')}
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                background: 'white',
                border: '2px solid #e5e7eb',
                borderTop: 'none',
                borderRadius: '0 0 12px 12px',
                padding: '24px'
              }}>
                {attivitaProgetto.length === 0 ? (
                  <p style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center', margin: 0 }}>
                    Nessuna attività presente per questo progetto
                  </p>
                ) : (
                  <>
                    {attivitaDaMostrare.map(att => {
                      const collaboratore = collaboratori.find(c => c.id === att.collaboratore_id);
                      return (
                        <div key={att.id} className="activity-item" style={{
                          borderLeft: `4px solid ${collaboratore?.colore || '#e5e7eb'}`
                        }}>
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
                              {new Date(att.data_inserimento).toLocaleDateString('it-IT')}
                            </span>
                          </div>
                          <p style={{ color: '#1e293b', marginTop: '6px', marginBottom: 0 }}>{att.testo}</p>
                        </div>
                      );
                    })}
                    
                    {attivitaProgetto.length > 10 && (
                      <button
                        className="btn btn-secondary"
                        style={{ width: '100%', marginTop: '16px' }}
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
            </div>
          );
        })
      )}
    </div>
  );
}
