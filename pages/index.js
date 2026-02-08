import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { verificaAdmin, verificaDashboard, verificaCollaboratore, initializeStorage, getCollaboratori } from '../utils/storage';

export default function Home() {
  const router = useRouter();
  const [modalAperto, setModalAperto] = useState(null);
  const [password, setPassword] = useState('');
  const [nomeCollaboratore, setNomeCollaboratore] = useState('');
  const [collaboratori, setCollaboratori] = useState([]);
  const [errore, setErrore] = useState('');

  useEffect(() => {
    initializeStorage();
    caricaCollaboratori();
  }, []);

  const caricaCollaboratori = async () => {
    const collab = await getCollaboratori();
    setCollaboratori(collab || []);
  };

  const handleAccessoAdmin = () => {
    if (verificaAdmin(password)) {
      router.push('/admin');
    } else {
      setErrore('Password errata');
    }
  };

  const handleAccessoDashboard = () => {
    if (verificaDashboard(password)) {
      router.push('/dashboard');
    } else {
      setErrore('Password errata');
    }
  };

  const handleAccessoCollaboratore = async () => {
    if (!nomeCollaboratore) {
      setErrore('Seleziona un collaboratore');
      return;
    }
    
    const collab = await verificaCollaboratore(nomeCollaboratore, password);
    if (collab) {
      sessionStorage.setItem('collaboratoreId', collab.id);
      router.push('/collaboratore');
    } else {
      setErrore('Password errata');
    }
  };

  const apriModal = (tipo) => {
    setModalAperto(tipo);
    setPassword('');
    setNomeCollaboratore('');
    setErrore('');
  };

  const chiudiModal = () => {
    setModalAperto(null);
    setPassword('');
    setNomeCollaboratore('');
    setErrore('');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '50px',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '500px',
        width: '90%'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          fontSize: '32px',
          color: '#1e293b'
        }}>
          Project Tracker
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button 
            className="btn btn-primary" 
            style={{ padding: '16px', fontSize: '18px' }}
            onClick={() => apriModal('admin')}
          >
            🔐 Accesso Admin
          </button>

          <button 
            className="btn btn-success" 
            style={{ padding: '16px', fontSize: '18px' }}
            onClick={() => apriModal('collaboratore')}
          >
            👤 Accesso Collaboratore
          </button>

          <button 
            className="btn btn-secondary" 
            style={{ padding: '16px', fontSize: '18px' }}
            onClick={() => apriModal('dashboard')}
          >
            📊 Dashboard
          </button>
        </div>
      </div>

      {modalAperto && (
        <div className="modal-overlay" onClick={chiudiModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>
              {modalAperto === 'admin' && '🔐 Login Admin'}
              {modalAperto === 'collaboratore' && '👤 Login Collaboratore'}
              {modalAperto === 'dashboard' && '📊 Login Dashboard'}
            </h2>

            {modalAperto === 'collaboratore' && (
              <div className="input-group">
                <label>Seleziona il tuo nome</label>
                <select 
                  value={nomeCollaboratore}
                  onChange={(e) => setNomeCollaboratore(e.target.value)}
                >
                  <option value="">-- Seleziona --</option>
                  {collaboratori.map(c => (
                    <option key={c.id} value={c.nome}>{c.nome}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    if (modalAperto === 'admin') handleAccessoAdmin();
                    if (modalAperto === 'collaboratore') handleAccessoCollaboratore();
                    if (modalAperto === 'dashboard') handleAccessoDashboard();
                  }
                }}
                placeholder="Inserisci password"
              />
            </div>

            {errore && (
              <div style={{ 
                color: '#dc2626', 
                background: '#fee2e2', 
                padding: '12px', 
                borderRadius: '6px',
                marginBottom: '16px'
              }}>
                {errore}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  if (modalAperto === 'admin') handleAccessoAdmin();
                  if (modalAperto === 'collaboratore') handleAccessoCollaboratore();
                  if (modalAperto === 'dashboard') handleAccessoDashboard();
                }}
              >
                Entra
              </button>
              <button 
                className="btn btn-secondary"
                onClick={chiudiModal}
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
