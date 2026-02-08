// ===================================
// STORAGE UTILITY - localStorage Manager
// ===================================
// Questo file gestisce tutto il salvataggio/caricamento dati
// Utilizzo funzioni pure per EVITARE re-render inutili

import bcrypt from 'bcryptjs';

// Password fisse (hashate) - NON visibili in chiaro
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('ses2026', 10);
const DASHBOARD_PASSWORD_HASH = bcrypt.hashSync('annamaria123', 10);

// ===================================
// INIZIALIZZAZIONE
// ===================================
export const initializeStorage = () => {
  if (typeof window === 'undefined') return;
  
  // Crea struttura iniziale se non esiste
  if (!localStorage.getItem('collaboratori')) {
    localStorage.setItem('collaboratori', JSON.stringify([]));
  }
  if (!localStorage.getItem('progetti')) {
    localStorage.setItem('progetti', JSON.stringify([]));
  }
  if (!localStorage.getItem('attivita')) {
    localStorage.setItem('attivita', JSON.stringify([]));
  }
};

// ===================================
// AUTENTICAZIONE
// ===================================
export const verificaAdmin = (password) => {
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
};

export const verificaDashboard = (password) => {
  return bcrypt.compareSync(password, DASHBOARD_PASSWORD_HASH);
};

export const verificaCollaboratore = (nome, password) => {
  const collaboratori = getCollaboratori();
  const collaboratore = collaboratori.find(c => c.nome === nome);
  
  if (!collaboratore) return null;
  
  const isValid = bcrypt.compareSync(password, collaboratore.passwordHash);
  return isValid ? collaboratore : null;
};

// ===================================
// COLLABORATORI
// ===================================
export const getCollaboratori = () => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('collaboratori');
  return data ? JSON.parse(data) : [];
};

export const saveCollaboratore = (nome, password, colore) => {
  const collaboratori = getCollaboratori();
  const nuovoCollaboratore = {
    id: Date.now().toString(),
    nome,
    passwordHash: bcrypt.hashSync(password, 10),
    colore
  };
  collaboratori.push(nuovoCollaboratore);
  localStorage.setItem('collaboratori', JSON.stringify(collaboratori));
  return nuovoCollaboratore;
};

export const updateCollaboratore = (id, updates) => {
  const collaboratori = getCollaboratori();
  const index = collaboratori.findIndex(c => c.id === id);
  if (index !== -1) {
    // Se viene aggiornata la password, hashala
    if (updates.password) {
      updates.passwordHash = bcrypt.hashSync(updates.password, 10);
      delete updates.password;
    }
    collaboratori[index] = { ...collaboratori[index], ...updates };
    localStorage.setItem('collaboratori', JSON.stringify(collaboratori));
    return collaboratori[index];
  }
  return null;
};

export const deleteCollaboratore = (id) => {
  let collaboratori = getCollaboratori();
  collaboratori = collaboratori.filter(c => c.id !== id);
  localStorage.setItem('collaboratori', JSON.stringify(collaboratori));
  
  // Elimina anche le attività del collaboratore
  let attivita = getAttivita();
  attivita = attivita.filter(a => a.collaboratoreId !== id);
  localStorage.setItem('attivita', JSON.stringify(attivita));
};

// ===================================
// PROGETTI
// ===================================
export const getProgetti = () => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('progetti');
  return data ? JSON.parse(data) : [];
};

export const saveProgetto = (titolo, sottotitolo, dataInizio, dataFine) => {
  const progetti = getProgetti();
  const nuovoProgetto = {
    id: Date.now().toString(),
    titolo,
    sottotitolo,
    dataInizio,
    dataFine
  };
  progetti.push(nuovoProgetto);
  localStorage.setItem('progetti', JSON.stringify(progetti));
  return nuovoProgetto;
};

export const updateProgetto = (id, updates) => {
  const progetti = getProgetti();
  const index = progetti.findIndex(p => p.id === id);
  if (index !== -1) {
    progetti[index] = { ...progetti[index], ...updates };
    localStorage.setItem('progetti', JSON.stringify(progetti));
    return progetti[index];
  }
  return null;
};

export const deleteProgetto = (id) => {
  let progetti = getProgetti();
  progetti = progetti.filter(p => p.id !== id);
  localStorage.setItem('progetti', JSON.stringify(progetti));
  
  // Elimina anche le attività del progetto
  let attivita = getAttivita();
  attivita = attivita.filter(a => a.progettoId !== id);
  localStorage.setItem('attivita', JSON.stringify(attivita));
};

export const ordinaProgetti = () => {
  const progetti = getProgetti();
  progetti.sort((a, b) => a.titolo.localeCompare(b.titolo));
  localStorage.setItem('progetti', JSON.stringify(progetti));
  return progetti;
};

// ===================================
// ATTIVITÀ
// ===================================
export const getAttivita = () => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('attivita');
  return data ? JSON.parse(data) : [];
};

export const getAttivitaByProgetto = (progettoId) => {
  const attivita = getAttivita();
  return attivita.filter(a => a.progettoId === progettoId);
};

export const getAttivitaByCollaboratore = (collaboratoreId, progettoId = null) => {
  const attivita = getAttivita();
  let filtered = attivita.filter(a => a.collaboratoreId === collaboratoreId);
  if (progettoId) {
    filtered = filtered.filter(a => a.progettoId === progettoId);
  }
  return filtered;
};

export const saveAttivita = (progettoId, collaboratoreId, testo) => {
  const attivita = getAttivita();
  const nuovaAttivita = {
    id: Date.now().toString(),
    progettoId,
    collaboratoreId,
    testo,
    dataInserimento: new Date().toISOString()
  };
  attivita.push(nuovaAttivita);
  localStorage.setItem('attivita', JSON.stringify(attivita));
  return nuovaAttivita;
};

export const updateAttivita = (id, testo) => {
  const attivita = getAttivita();
  const index = attivita.findIndex(a => a.id === id);
  if (index !== -1) {
    attivita[index].testo = testo;
    localStorage.setItem('attivita', JSON.stringify(attivita));
    return attivita[index];
  }
  return null;
};

export const deleteAttivita = (id) => {
  let attivita = getAttivita();
  attivita = attivita.filter(a => a.id !== id);
  localStorage.setItem('attivita', JSON.stringify(attivita));
};

// ===================================
// UTILITY PER DASHBOARD
// ===================================
export const getUltimaAttivitaCollaboratore = (collaboratoreId) => {
  const attivita = getAttivita();
  const attivitaCollaboratore = attivita.filter(a => a.collaboratoreId === collaboratoreId);
  
  if (attivitaCollaboratore.length === 0) return null;
  
  // Ordina per data più recente
  attivitaCollaboratore.sort((a, b) => 
    new Date(b.dataInserimento) - new Date(a.dataInserimento)
  );
  
  return attivitaCollaboratore[0];
};

export const getStatusCollaboratore = (collaboratoreId) => {
  const ultimaAttivita = getUltimaAttivitaCollaboratore(collaboratoreId);
  
  if (!ultimaAttivita) return 'red'; // Nessuna attività
  
  const oggi = new Date();
  const dataAttivita = new Date(ultimaAttivita.dataInserimento);
  const differenzaGiorni = Math.floor((oggi - dataAttivita) / (1000 * 60 * 60 * 24));
  
  if (differenzaGiorni <= 7) return 'green';
  if (differenzaGiorni <= 10) return 'orange';
  return 'red';
};

// ===================================
// UTILITY PER FILTRI
// ===================================
export const filtraAttivita = (filtri) => {
  let attivita = getAttivita();
  const { dataInizio, dataFine, progettoId, collaboratoreId } = filtri;
  
  if (progettoId) {
    attivita = attivita.filter(a => a.progettoId === progettoId);
  }
  
  if (collaboratoreId) {
    attivita = attivita.filter(a => a.collaboratoreId === collaboratoreId);
  }
  
  if (dataInizio) {
    attivita = attivita.filter(a => 
      new Date(a.dataInserimento) >= new Date(dataInizio)
    );
  }
  
  if (dataFine) {
    attivita = attivita.filter(a => 
      new Date(a.dataInserimento) <= new Date(dataFine)
    );
  }
  
  return attivita;
};
