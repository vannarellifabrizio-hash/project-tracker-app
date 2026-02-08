// ===================================
// STORAGE UTILITY - Supabase Version
// ===================================
// Questo file sostituisce storage.js quando passi a Supabase

import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';

// Password fisse (da variabili d'ambiente in production)
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'ses2026', 10);
const DASHBOARD_PASSWORD_HASH = bcrypt.hashSync(process.env.DASHBOARD_PASSWORD || 'annamaria123', 10);

// ===================================
// AUTENTICAZIONE
// ===================================
export const verificaAdmin = (password) => {
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
};

export const verificaDashboard = (password) => {
  return bcrypt.compareSync(password, DASHBOARD_PASSWORD_HASH);
};

export const verificaCollaboratore = async (nome, password) => {
  const { data, error } = await supabase
    .from('collaboratori')
    .select('*')
    .eq('nome', nome)
    .single();
  
  if (error || !data) return null;
  
  const isValid = bcrypt.compareSync(password, data.password_hash);
  return isValid ? data : null;
};

// ===================================
// COLLABORATORI
// ===================================
export const getCollaboratori = async () => {
  const { data, error } = await supabase
    .from('collaboratori')
    .select('*')
    .order('nome');
  
  return data || [];
};

export const saveCollaboratore = async (nome, password, colore) => {
  const { data, error } = await supabase
    .from('collaboratori')
    .insert([
      {
        nome,
        password_hash: bcrypt.hashSync(password, 10),
        colore
      }
    ])
    .select()
    .single();
  
  return data;
};

export const updateCollaboratore = async (id, updates) => {
  if (updates.password) {
    updates.password_hash = bcrypt.hashSync(updates.password, 10);
    delete updates.password;
  }
  
  const { data, error } = await supabase
    .from('collaboratori')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return data;
};

export const deleteCollaboratore = async (id) => {
  // Elimina prima le attività
  await supabase.from('attivita').delete().eq('collaboratore_id', id);
  
  // Poi il collaboratore
  await supabase.from('collaboratori').delete().eq('id', id);
};

// ===================================
// PROGETTI
// ===================================
export const getProgetti = async () => {
  const { data, error } = await supabase
    .from('progetti')
    .select('*')
    .order('titolo');
  
  return data || [];
};

export const saveProgetto = async (titolo, sottotitolo, dataInizio, dataFine) => {
  const { data, error } = await supabase
    .from('progetti')
    .insert([
      {
        titolo,
        sottotitolo,
        data_inizio: dataInizio,
        data_fine: dataFine
      }
    ])
    .select()
    .single();
  
  return data;
};

export const updateProgetto = async (id, updates) => {
  // Converti nomi campi da camelCase a snake_case per Supabase
  const supabaseUpdates = {};
  if (updates.titolo !== undefined) supabaseUpdates.titolo = updates.titolo;
  if (updates.sottotitolo !== undefined) supabaseUpdates.sottotitolo = updates.sottotitolo;
  if (updates.dataInizio !== undefined) supabaseUpdates.data_inizio = updates.dataInizio;
  if (updates.dataFine !== undefined) supabaseUpdates.data_fine = updates.dataFine;
  
  const { data, error } = await supabase
    .from('progetti')
    .update(supabaseUpdates)
    .eq('id', id)
    .select()
    .single();
  
  return data;
};

export const deleteProgetto = async (id) => {
  // Elimina prima le attività
  await supabase.from('attivita').delete().eq('progetto_id', id);
  
  // Poi il progetto
  await supabase.from('progetti').delete().eq('id', id);
};

export const ordinaProgetti = async () => {
  const { data } = await supabase
    .from('progetti')
    .select('*')
    .order('titolo');
  
  return data || [];
};

// ===================================
// ATTIVITÀ
// ===================================
export const getAttivita = async () => {
  const { data, error } = await supabase
    .from('attivita')
    .select('*')
    .order('data_inserimento', { ascending: false });
  
  return data || [];
};

export const getAttivitaByProgetto = async (progettoId) => {
  const { data, error } = await supabase
    .from('attivita')
    .select('*')
    .eq('progetto_id', progettoId)
    .order('data_inserimento', { ascending: false });
  
  return data || [];
};

export const getAttivitaByCollaboratore = async (collaboratoreId, progettoId = null) => {
  let query = supabase
    .from('attivita')
    .select('*')
    .eq('collaboratore_id', collaboratoreId);
  
  if (progettoId) {
    query = query.eq('progetto_id', progettoId);
  }
  
  const { data, error } = await query.order('data_inserimento', { ascending: false });
  
  return data || [];
};

export const saveAttivita = async (progettoId, collaboratoreId, testo) => {
  const { data, error } = await supabase
    .from('attivita')
    .insert([
      {
        progetto_id: progettoId,
        collaboratore_id: collaboratoreId,
        testo
      }
    ])
    .select()
    .single();
  
  return data;
};

export const updateAttivita = async (id, testo) => {
  const { data, error } = await supabase
    .from('attivita')
    .update({ testo })
    .eq('id', id)
    .select()
    .single();
  
  return data;
};

export const deleteAttivita = async (id) => {
  await supabase.from('attivita').delete().eq('id', id);
};

// ===================================
// UTILITY PER DASHBOARD
// ===================================
export const getUltimaAttivitaCollaboratore = async (collaboratoreId) => {
  const { data, error } = await supabase
    .from('attivita')
    .select('*')
    .eq('collaboratore_id', collaboratoreId)
    .order('data_inserimento', { ascending: false })
    .limit(1)
    .single();
  
  return data;
};

export const getStatusCollaboratore = async (collaboratoreId) => {
  const ultimaAttivita = await getUltimaAttivitaCollaboratore(collaboratoreId);
  
  if (!ultimaAttivita) return 'red';
  
  const oggi = new Date();
  const dataAttivita = new Date(ultimaAttivita.data_inserimento);
  const differenzaGiorni = Math.floor((oggi - dataAttivita) / (1000 * 60 * 60 * 24));
  
  if (differenzaGiorni <= 7) return 'green';
  if (differenzaGiorni <= 10) return 'orange';
  return 'red';
};

// ===================================
// UTILITY PER FILTRI
// ===================================
export const filtraAttivita = async (filtri) => {
  let query = supabase.from('attivita').select('*');
  
  if (filtri.progettoId) {
    query = query.eq('progetto_id', filtri.progettoId);
  }
  
  if (filtri.collaboratoreId) {
    query = query.eq('collaboratore_id', filtri.collaboratoreId);
  }
  
  if (filtri.dataInizio) {
    query = query.gte('data_inserimento', filtri.dataInizio);
  }
  
  if (filtri.dataFine) {
    // Aggiungi 1 giorno per includere tutto il giorno finale
    const dataFinePiu1 = new Date(filtri.dataFine);
    dataFinePiu1.setDate(dataFinePiu1.getDate() + 1);
    query = query.lt('data_inserimento', dataFinePiu1.toISOString());
  }
  
  const { data, error } = await query.order('data_inserimento', { ascending: false });
  
  return data || [];
};

// ===================================
// NOTA: Inizializzazione non serve con Supabase
// ===================================
export const initializeStorage = () => {
  // Nessuna inizializzazione necessaria con Supabase
  // Le tabelle sono già create nel database
};
