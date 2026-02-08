import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  getProgetti,
  getCollaboratori,
  getAttivitaByCollaboratore,
  saveAttivita,
  updateAttivita,
  deleteAttivita
} from '../utils/storage';

export default function Collaboratore() {
  const router = useRouter();
  const [collaboratoreCorrente, setCollaboratoreCorrente] = useState(null);
  const [progetti, setProgetti] = useState([]);
  const [progettiFiltrati, setProgettiFiltrati] = useState([]);
  const [attivitaPerProgetto, setAttivitaPerProgetto] = useState({});
  
  // Ricerca progetti
  const [ricerca, setRicerca] = useState('');
  const [ricercaApplicata, setRicercaApplicata] = useState('');
  
  // Nuovo attività (per ogni progetto)
  const [nuovoTestoPerProgetto, setNuovoTestoPerProgetto] = useState({});
  
  // Modifica attività
  const [editingAttivita, setEditingAttivita] = useState(null);
  
  // Espansione attività
  const [progettiEspansi, setProgettiEspansi] = useState({});

  useEffect(() => {
    // Recupera l'ID del collaboratore loggato
    const collabId = sessionStorage.getItem('collaboratoreId');
    if (!collabId) {
      router.push('/');
      return;
    }
    
    const collaboratori = getCollaboratori();
    const collab = collaboratori.find(c => c.id === collabId);
    if (!collab) {
      router.push('/');
      return;
    }
    
    setCollaboratoreCorrente(collab);
    caricaDati(collabId);
  }, []);

  const caricaDati = useCallback((collabId) => {
    const tuttiProgetti = getProgetti();
    setProgetti(tuttiProgetti);
    setProgettiFiltrati(tuttiProgetti);
    
    // Carica attività per ogni progetto
    const attivitaMap = {};
    tuttiProgetti.forEach(progetto => {
      const attivita = getAttivitaByCollaboratore(collabId, progetto.id);
      // Ordina dalla più recente alla più vecchia
      attivita.sort((a, b) => new Date(b.dataInserimento) - new Date(a.dataInserimento));
      attivitaMap[progetto.id] = attivita;
    });
    setAttivitaPerProgetto(attivitaMap);
  }, []);

  // ===================================
  // RICERCA PROGETTI
  // ===================================
  const applicaRicerca = () => {
    if (!ricerca.trim()) {
      setProgettiFiltrati(progetti);
      setRicercaApplicata('');
      return;
    }
    
    const termineRicerca = ricerca.toLowerCase().trim();
    const filtrati = progetti.filter(p => 
      p.titolo.toLowerCase().includes(termineRicerca) ||
      (p.sottotitolo && p.sottotitolo.toLowerCase().includes(termineRicerca))
    );
    
    setProgettiFiltrati(filtrati);
    setRicercaApplicata(termineRicerca);
  };

  const resetRicerca = () => {
    setRicerca('');
    setRicercaApplicata('');
    setProgettiFiltrati(progetti);
  };

  // ===================================
  // GESTIONE ATTIVITÀ
  // ===================================
  
  // IMPORTANTE: Uso una funzione separata per ogni progetto per evitare re-render
  const handleTestoChange = (progettoId, valore) => {
    setNuovoTestoPerProgetto(prev => ({
      ...prev,
      [progettoId]: valore
    }));
  };

  const aggiungiAttivita = (progettoId) => {
    const testo = nuovoTestoPerProgetto[progettoId];
    
    if (!testo || !testo.trim()) {
      alert('Inserisci un testo per l\'attività');
      return;
    }
    
    saveAttivita(progettoId, collaboratoreCorrente.id, testo.trim());
    
    // Resetta solo il campo di questo progetto
    setNuovoTestoPerProgetto(prev => ({
      ...prev,
      [progettoId]: ''
    }));
    
    caricaDati(collaboratoreCorrente.id);
  };

  const iniziaModificaAttivita = (attivita) => {
    setEditingAttivita({
      id: attivita.id,
      testo: attivita.testo
    });
  };

  const salvaModificaAttivita = () => {
    if (!editingAttivita.testo.trim()) {
      alert('Il testo non può essere vuoto');
      return;
    }
    
    updateAttivita(editingAttivita.id, editingAttivita.testo.trim());
    setEditingAttivita(null);
    caricaDati(collaboratoreCorrente.id);
  };

  const eliminaAttivitaConferma = (id) => {
    if (confirm('Sei sicuro di voler eliminare questa attività?')) {
      deleteAttivita(id);
      caricaDati(collaboratoreCorrente.id);
    }
  };

  const toggleEspansione = (progettoId) => {
    setProgettiEspansi(prev => ({
      ...prev,
      [progettoId]: !prev[progettoId]
    }));
  };

  if (!collaboratoreCorrente) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>
          👤 Ciao, <span style={{ color: collaboratoreCorrente.colore }}>
            {collaboratoreCorrente.nome}
          </span>
        </h1>
        <button className="logout-btn" onClick={() => router.push('/')}>
          Esci
        </button>
      </div>

      {/* RICERCA PROGETTI */}
      <div className="card" style={{ background: '#f8fafc' }}>
        <h2 style={{ marginBottom: '16px' }}>🔍 Cerca Progetti</h2>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <input
              type="text"
              className="search-box"
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') applicaRicerca();
              }}
              placeholder="Scrivi il nome del progetto..."
            />
          </div>
          <button className="btn btn-primary" onClick={applicaRicerca}>
            Cerca
          </button>
          {ricercaApplicata && (
            <button className="btn btn-secondary" onClick={resetRicerca}>
              Reset
            </button>
          )}
        </div>
        
        {ricercaApplicata && (
          <div style={{ marginTop: '12px', color: '#64748b' }}>
            Risultati per: "<strong>{ricercaApplicata}</strong>" 
            ({progettiFiltrati.length} progetti trovati)
          </div>
        )}
      </div>

      {/* LISTA PROGETTI */}
      {progettiFiltrati.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#64748b' }}>
            {ricercaApplicata 
              ? 'Nessun progetto trovato con questa ricerca' 
              : 'Nessun progetto disponibile'}
          </p>
        </div>
      ) : (
        progettiFiltrati.map(progetto => {
          const attivita = attivitaPerProgetto[progetto.id] || [];
          const isEspanso = progettiEspansi[progetto.id];
          const attivitaDaMostrare = isEspanso ? attivita : attivita.slice(0, 10);
          
          return (
            <div key={progetto.id} className="project-card">
              {/* HEADER PROGETTO */}
              <div className="project-header">
                <div>
                  <h2>{progetto.titolo}</h2>
                  {progetto.sottotitolo && (
                    <p style={{ color: '#64748b', marginTop: '4px' }}>
                      {progetto.sottotitolo}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right', fontSize: '14px', color: '#64748b' }}>
                  {progetto.dataInizio && (
                    <div>Inizio: {new Date(progetto.dataInizio).toLocaleDateString('it-IT')}</div>
                  )}
                  {progetto.dataFine && (
                    <div>Fine: {new Date(progetto.dataFine).toLocaleDateString('it-IT')}</div>
                  )}
                </div>
              </div>

              {/* AGGIUNGI NUOVA ATTIVITÀ */}
              <div style={{ 
                background: '#f0fdf4', 
                padding: '16px', 
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>
                  ➕ Aggiungi Attività
                </h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <textarea
                    value={nuovoTestoPerProgetto[progetto.id] || ''}
                    onChange={(e) => handleTestoChange(progetto.id, e.target.value)}
                    placeholder="Descrivi cosa hai fatto..."
                    rows="3"
                    style={{ flex: 1, resize: 'vertical' }}
                  />
                  <button
                    className="btn btn-success"
                    onClick={() => aggiungiAttivita(progetto.id)}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    Salva
                  </button>
                </div>
              </div>

              {/* LISTA ATTIVITÀ */}
              <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>
                📋 Le Tue Attività ({attivita.length})
              </h3>
              
              {attivita.length === 0 ? (
                <p style={{ color: '#64748b', fontStyle: 'italic' }}>
                  Nessuna attività inserita per questo progetto
                </p>
              ) : (
                <>
                  {attivitaDaMostrare.map(att => (
                    <div key={att.id} className="activity-item">
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <div>
                          <span 
                            style={{ 
                              fontWeight: 'bold', 
                              color: collaboratoreCorrente.colore 
                            }}
                          >
                            • {collaboratoreCorrente.nome}
                          </span>
                          <span style={{ color: '#64748b', marginLeft: '12px', fontSize: '14px' }}>
                            {new Date(att.dataInserimento).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 12px', fontSize: '14px' }}
                            onClick={() => iniziaModificaAttivita(att)}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '4px 12px', fontSize: '14px' }}
                            onClick={() => eliminaAttivitaConferma(att.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <p style={{ color: '#1e293b' }}>{att.testo}</p>
                    </div>
                  ))}
                  
                  {/* PULSANTE ESPANDI/COMPRIMI */}
                  {attivita.length > 10 && (
                    <button
                      className="btn btn-secondary"
                      style={{ width: '100%', marginTop: '12px' }}
                      onClick={() => toggleEspansione(progetto.id)}
                    >
                      {isEspanso 
                        ? `⬆️ Mostra solo le prime 10 attività` 
                        : `⬇️ Mostra tutte le attività (${attivita.length})`}
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })
      )}

      {/* MODAL MODIFICA ATTIVITÀ */}
      {editingAttivita && (
        <div className="modal-overlay" onClick={() => setEditingAttivita(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>✏️ Modifica Attività</h2>
            
            <div className="input-group">
              <label>Testo Attività</label>
              <textarea
                value={editingAttivita.testo}
                onChange={(e) => setEditingAttivita({ ...editingAttivita, testo: e.target.value })}
                rows="5"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-success" onClick={salvaModificaAttivita}>
                Salva Modifiche
              </button>
              <button className="btn btn-secondary" onClick={() => setEditingAttivita(null)}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
