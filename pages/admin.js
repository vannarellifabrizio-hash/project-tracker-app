import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  getCollaboratori,
  saveCollaboratore,
  updateCollaboratore,
  deleteCollaboratore,
  getProgetti,
  saveProgetto,
  updateProgetto,
  deleteProgetto,
  ordinaProgetti
} from '../utils/storage';

export default function Admin() {
  const router = useRouter();
  
  // State per collaboratori
  const [collaboratori, setCollaboratori] = useState([]);
  const [nuovoNome, setNuovoNome] = useState('');
  const [nuovaPassword, setNuovaPassword] = useState('');
  const [nuovoColore, setNuovoColore] = useState('#3b82f6');
  const [editingCollab, setEditingCollab] = useState(null);
  
  // State per progetti
  const [progetti, setProgetti] = useState([]);
  const [nuovoTitolo, setNuovoTitolo] = useState('');
  const [nuovoSottotitolo, setNuovoSottotitolo] = useState('');
  const [nuovaDataInizio, setNuovaDataInizio] = useState('');
  const [nuovaDataFine, setNuovaDataFine] = useState('');
  const [editingProgetto, setEditingProgetto] = useState(null);
  
  const [tabAttiva, setTabAttiva] = useState('collaboratori'); // 'collaboratori' o 'progetti'

  useEffect(() => {
    caricaDati();
  }, []);

  const caricaDati = useCallback(() => {
    setCollaboratori(getCollaboratori());
    setProgetti(getProgetti());
  }, []);

  // ===================================
  // GESTIONE COLLABORATORI
  // ===================================
  const aggiungiCollaboratore = () => {
    if (!nuovoNome.trim() || !nuovaPassword.trim()) {
      alert('Nome e password sono obbligatori');
      return;
    }
    
    saveCollaboratore(nuovoNome.trim(), nuovaPassword, nuovoColore);
    setNuovoNome('');
    setNuovaPassword('');
    setNuovoColore('#3b82f6');
    caricaDati();
  };

  const iniziaModificaCollaboratore = (collab) => {
    setEditingCollab({
      id: collab.id,
      nome: collab.nome,
      colore: collab.colore,
      password: '' // Non mostriamo mai la password
    });
  };

  const salvaModificaCollaboratore = () => {
    if (!editingCollab.nome.trim()) {
      alert('Il nome è obbligatorio');
      return;
    }
    
    const updates = {
      nome: editingCollab.nome.trim(),
      colore: editingCollab.colore
    };
    
    // Solo se è stata inserita una nuova password
    if (editingCollab.password.trim()) {
      updates.password = editingCollab.password;
    }
    
    updateCollaboratore(editingCollab.id, updates);
    setEditingCollab(null);
    caricaDati();
  };

  const eliminaCollaboratoreConferma = (id, nome) => {
    if (confirm(`Sei sicuro di voler eliminare ${nome}? Verranno eliminate anche tutte le sue attività.`)) {
      deleteCollaboratore(id);
      caricaDati();
    }
  };

  // ===================================
  // GESTIONE PROGETTI
  // ===================================
  const aggiungiProgetto = () => {
    if (!nuovoTitolo.trim()) {
      alert('Il titolo è obbligatorio');
      return;
    }
    
    saveProgetto(
      nuovoTitolo.trim(),
      nuovoSottotitolo.trim(),
      nuovaDataInizio,
      nuovaDataFine
    );
    
    setNuovoTitolo('');
    setNuovoSottotitolo('');
    setNuovaDataInizio('');
    setNuovaDataFine('');
    caricaDati();
  };

  const iniziaModificaProgetto = (progetto) => {
    setEditingProgetto({ ...progetto });
  };

  const salvaModificaProgetto = () => {
    if (!editingProgetto.titolo.trim()) {
      alert('Il titolo è obbligatorio');
      return;
    }
    
    updateProgetto(editingProgetto.id, {
      titolo: editingProgetto.titolo.trim(),
      sottotitolo: editingProgetto.sottotitolo.trim(),
      dataInizio: editingProgetto.dataInizio,
      dataFine: editingProgetto.dataFine
    });
    
    setEditingProgetto(null);
    caricaDati();
  };

  const eliminaProgettoConferma = (id, titolo) => {
    if (confirm(`Sei sicuro di voler eliminare "${titolo}"? Verranno eliminate anche tutte le attività associate.`)) {
      deleteProgetto(id);
      caricaDati();
    }
  };

  const ordinaProgettiPerNome = () => {
    const progettiOrdinati = ordinaProgetti();
    setProgetti([...progettiOrdinati]);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🔐 Pannello Admin</h1>
        <button className="logout-btn" onClick={() => router.push('/')}>
          Esci
        </button>
      </div>

      {/* TAB NAVIGATION */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '30px',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '10px'
      }}>
        <button
          className="btn"
          style={{
            background: tabAttiva === 'collaboratori' ? '#2563eb' : '#e5e7eb',
            color: tabAttiva === 'collaboratori' ? 'white' : '#374151'
          }}
          onClick={() => setTabAttiva('collaboratori')}
        >
          👥 Collaboratori ({collaboratori.length})
        </button>
        <button
          className="btn"
          style={{
            background: tabAttiva === 'progetti' ? '#2563eb' : '#e5e7eb',
            color: tabAttiva === 'progetti' ? 'white' : '#374151'
          }}
          onClick={() => setTabAttiva('progetti')}
        >
          📁 Progetti ({progetti.length})
        </button>
      </div>

      {/* ================================= */}
      {/* TAB COLLABORATORI */}
      {/* ================================= */}
      {tabAttiva === 'collaboratori' && (
        <>
          <div className="card">
            <h2 style={{ marginBottom: '20px' }}>➕ Aggiungi Collaboratore</h2>
            
            <div className="input-group">
              <label>Nome</label>
              <input
                type="text"
                value={nuovoNome}
                onChange={(e) => setNuovoNome(e.target.value)}
                placeholder="Es: Mario Rossi"
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={nuovaPassword}
                onChange={(e) => setNuovaPassword(e.target.value)}
                placeholder="Imposta una password"
              />
            </div>

            <div className="input-group">
              <label>Colore</label>
              <input
                type="color"
                value={nuovoColore}
                onChange={(e) => setNuovoColore(e.target.value)}
                style={{ height: '50px', cursor: 'pointer' }}
              />
            </div>

            <button className="btn btn-success" onClick={aggiungiCollaboratore}>
              Aggiungi Collaboratore
            </button>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '20px' }}>📋 Lista Collaboratori</h2>
            
            {collaboratori.length === 0 ? (
              <p style={{ color: '#64748b' }}>Nessun collaboratore presente. Aggiungine uno!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {collaboratori.map(collab => (
                  <div
                    key={collab.id}
                    style={{
                      padding: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          background: collab.colore
                        }}
                      />
                      <span style={{ fontSize: '18px', fontWeight: '500' }}>
                        {collab.nome}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px' }}
                        onClick={() => iniziaModificaCollaboratore(collab)}
                      >
                        ✏️ Modifica
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '8px 16px' }}
                        onClick={() => eliminaCollaboratoreConferma(collab.id, collab.nome)}
                      >
                        🗑️ Elimina
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ================================= */}
      {/* TAB PROGETTI */}
      {/* ================================= */}
      {tabAttiva === 'progetti' && (
        <>
          <div className="card">
            <h2 style={{ marginBottom: '20px' }}>➕ Aggiungi Progetto</h2>
            
            <div className="input-group">
              <label>Titolo *</label>
              <input
                type="text"
                value={nuovoTitolo}
                onChange={(e) => setNuovoTitolo(e.target.value)}
                placeholder="Es: Sviluppo App Mobile"
              />
            </div>

            <div className="input-group">
              <label>Sottotitolo</label>
              <input
                type="text"
                value={nuovoSottotitolo}
                onChange={(e) => setNuovoSottotitolo(e.target.value)}
                placeholder="Es: Versione iOS e Android"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Data Inizio</label>
                <input
                  type="date"
                  value={nuovaDataInizio}
                  onChange={(e) => setNuovaDataInizio(e.target.value)}
                />
              </div>

              <div className="input-group" style={{ flex: 1 }}>
                <label>Data Fine</label>
                <input
                  type="date"
                  value={nuovaDataFine}
                  onChange={(e) => setNuovaDataFine(e.target.value)}
                />
              </div>
            </div>

            <button className="btn btn-success" onClick={aggiungiProgetto}>
              Aggiungi Progetto
            </button>
          </div>

          <div className="card">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2>📋 Lista Progetti</h2>
              <button
                className="btn btn-secondary"
                style={{ padding: '8px 16px' }}
                onClick={ordinaProgettiPerNome}
              >
                🔤 Ordina A-Z
              </button>
            </div>
            
            {progetti.length === 0 ? (
              <p style={{ color: '#64748b' }}>Nessun progetto presente. Aggiungine uno!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {progetti.map(progetto => (
                  <div
                    key={progetto.id}
                    style={{
                      padding: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <h3 style={{ marginBottom: '4px' }}>{progetto.titolo}</h3>
                        {progetto.sottotitolo && (
                          <p style={{ color: '#64748b', fontSize: '14px' }}>
                            {progetto.sottotitolo}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '8px 16px' }}
                          onClick={() => iniziaModificaProgetto(progetto)}
                        >
                          ✏️ Modifica
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '8px 16px' }}
                          onClick={() => eliminaProgettoConferma(progetto.id, progetto.titolo)}
                        >
                          🗑️ Elimina
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      gap: '20px',
                      fontSize: '14px',
                      color: '#64748b'
                    }}>
                      {progetto.dataInizio && (
                        <span>📅 Inizio: {new Date(progetto.dataInizio).toLocaleDateString('it-IT')}</span>
                      )}
                      {progetto.dataFine && (
                        <span>🏁 Fine: {new Date(progetto.dataFine).toLocaleDateString('it-IT')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ================================= */}
      {/* MODAL MODIFICA COLLABORATORE */}
      {/* ================================= */}
      {editingCollab && (
        <div className="modal-overlay" onClick={() => setEditingCollab(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>✏️ Modifica Collaboratore</h2>
            
            <div className="input-group">
              <label>Nome</label>
              <input
                type="text"
                value={editingCollab.nome}
                onChange={(e) => setEditingCollab({ ...editingCollab, nome: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Nuova Password (lascia vuoto per non cambiarla)</label>
              <input
                type="password"
                value={editingCollab.password}
                onChange={(e) => setEditingCollab({ ...editingCollab, password: e.target.value })}
                placeholder="Nuova password (opzionale)"
              />
            </div>

            <div className="input-group">
              <label>Colore</label>
              <input
                type="color"
                value={editingCollab.colore}
                onChange={(e) => setEditingCollab({ ...editingCollab, colore: e.target.value })}
                style={{ height: '50px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-success" onClick={salvaModificaCollaboratore}>
                Salva Modifiche
              </button>
              <button className="btn btn-secondary" onClick={() => setEditingCollab(null)}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================= */}
      {/* MODAL MODIFICA PROGETTO */}
      {/* ================================= */}
      {editingProgetto && (
        <div className="modal-overlay" onClick={() => setEditingProgetto(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>✏️ Modifica Progetto</h2>
            
            <div className="input-group">
              <label>Titolo</label>
              <input
                type="text"
                value={editingProgetto.titolo}
                onChange={(e) => setEditingProgetto({ ...editingProgetto, titolo: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Sottotitolo</label>
              <input
                type="text"
                value={editingProgetto.sottotitolo}
                onChange={(e) => setEditingProgetto({ ...editingProgetto, sottotitolo: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Data Inizio</label>
              <input
                type="date"
                value={editingProgetto.dataInizio}
                onChange={(e) => setEditingProgetto({ ...editingProgetto, dataInizio: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Data Fine</label>
              <input
                type="date"
                value={editingProgetto.dataFine}
                onChange={(e) => setEditingProgetto({ ...editingProgetto, dataFine: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-success" onClick={salvaModificaProgetto}>
                Salva Modifiche
              </button>
              <button className="btn btn-secondary" onClick={() => setEditingProgetto(null)}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
