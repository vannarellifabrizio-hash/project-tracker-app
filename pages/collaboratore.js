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
  
  const [ricerca, setRicerca] = useState('');
  const [ricercaApplicata, setRicercaApplicata] = useState('');
  const [nuovoTestoPerProgetto, setNuovoTestoPerProgetto] = useState({});
  const [editingAttivita, setEditingAttivita] = useState(null);
  const [progettiEspansi, setProgettiEspansi] = useState({});

  useEffect(() => {
    inizializza();
  }, []);

  const inizializza = async () => {
    const collabId = sessionStorage.getItem('collaboratoreId');
    if (!collabId) {
      router.push('/');
      return;
    }
    
    const collaboratori = await getCollaboratori();
    const collab = collaboratori.find(c => c.id === collabId);
    if (!collab) {
      router.push('/');
      return;
    }
    
    setCollaboratoreCorrente(collab);
    await caricaDati(collabId);
  };

  const caricaDati = useCallback(async (collabId) => {
    const tuttiProgetti = await getProgetti();
    setProgetti(tuttiProgetti || []);
    setProgettiFiltrati(tuttiProgetti || []);
    
    const attivitaMap = {};
    for (const progetto of tuttiProgetti) {
      const attivita = await getAttivitaByCollaboratore(collabId, progetto.id);
      attivita.sort((a, b) => new Date(b.data_inserimento) - new Date(a.data_inserimento));
      attivitaMap[progetto.id] = attivita;
    }
    setAttivitaPerProgetto(attivitaMap);
  }, []);

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

  const scrollToProgetto = (progettoId) => {
    const element = document.getElementById(`progetto-${progettoId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Highlight temporaneo
      element.style.boxShadow = '0 0 0 3px #2563eb';
      setTimeout(() => {
        element.style.boxShadow = '';
      }, 2000);
    }
  };

  const handleTestoChange = (progettoId, valore) => {
    setNuovoTestoPerProgetto(prev => ({
      ...prev,
      [progettoId]: valore
    }));
  };

  const aggiungiAttivita = async (progettoId) => {
    const testo = nuovoTestoPerProgetto[progettoId];
    
    if (!testo || !testo.trim()) {
      alert('Inserisci un testo per l\'attività');
      return;
    }
    
    await saveAttivita(progettoId, collaboratoreCorrente.id, testo.trim());
    
    setNuovoTestoPerProgetto(prev => ({
      ...prev,
      [progettoId]: ''
    }));
    
    await caricaDati(collaboratoreCorrente.id);
  };

  const iniziaModificaAttivita = (attivita) => {
    setEditingAttivita({
      id: attivita.id,
      testo: attivita.testo
    });
  };

  const salvaModificaAttivita = async () => {
    if (!editingAttivita.testo.trim()) {
      alert('Il testo non può essere vuoto');
      return;
    }
    
    await updateAttivita(editingAttivita.id, editingAttivita.testo.trim());
    setEditingAttivita(null);
    await caricaDati(collaboratoreCorrente.id);
  };

  const eliminaAttivitaConferma = async (id) => {
    if (confirm('Sei sicuro di voler eliminare questa attività?')) {
      await deleteAttivita(id);
      await caricaDati(collaboratoreCorrente.id);
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

      {/* SEZIONE RICERCA + LISTA PROGETTI */}
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
        
        {/* LISTA TUTTI I PROGETTI - GRIGLIA RESPONSIVA */}
        {progetti.length > 0 && !ricercaApplicata && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '2px solid #e5e7eb' }}>
            <h3 style={{ 
              fontSize: '15px', 
              color: '#64748b', 
              marginBottom: '16px',
              fontWeight: '600'
            }}>
              📁 Tutti i progetti ({progetti.length})
            </h3>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              {progetti.map(p => {
                const numAttivita = attivitaPerProgetto[p.id]?.length || 0;
                const hasAttivita = numAttivita > 0;
                
                return (
                  <button
                    key={p.id}
                    onClick={() => scrollToProgetto(p.id)}
                    style={{
                      padding: '12px 16px',
                      background: hasAttivita ? '#f0fdf4' : 'white',
                      border: `2px solid ${hasAttivita ? '#22c55e' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#1e293b',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <span style={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block'
                    }}>
                      {p.titolo}
                    </span>
                    {numAttivita > 0 && (
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#22c55e',
                        fontWeight: '600'
                      }}>
                        {numAttivita} attività
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div style={{ 
              marginTop: '12px', 
              fontSize: '13px', 
              color: '#64748b',
              fontStyle: 'italic'
            }}>
              💡 Clicca su un progetto per raggiungerlo velocemente
            </div>
          </div>
        )}
        
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
            <div 
              key={progetto.id} 
              id={`progetto-${progetto.id}`}
              className="project-card"
              style={{ 
                transition: 'box-shadow 0.3s',
                scrollMarginTop: '100px'
              }}
            >
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
                  {progetto.data_inizio && (
                    <div>Inizio: {new Date(progetto.data_inizio).toLocaleDateString('it-IT')}</div>
                  )}
                  {progetto.data_fine && (
                    <div>Fine: {new Date(progetto.data_fine).toLocaleDateString('it-IT')}</div>
                  )}
                </div>
              </div>

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
                            {new Date(att.data_inserimento).toLocaleDateString('it-IT')}
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
