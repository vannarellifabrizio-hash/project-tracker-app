# 📊 Project Tracker App

Web app completa per la gestione di collaboratori, progetti e attività con 3 livelli di accesso.

---

## 🎯 **Caratteristiche Principali**

### **3 Aree di Accesso:**
1. **ADMIN** (password: `ses2026`) - Gestisce collaboratori e progetti
2. **COLLABORATORI** - Accedono con nome e password, gestiscono le loro attività
3. **DASHBOARD** (password: `annamaria123`) - Vista completa con export PDF

### **Funzionalità:**
- ✅ Gestione collaboratori con colori personalizzati
- ✅ Gestione progetti con date inizio/fine
- ✅ Attività private per collaboratore
- ✅ Ricerca progetti
- ✅ Dashboard con status collaboratori (verde/arancione/rosso)
- ✅ Filtri avanzati (data, progetto, collaboratore)
- ✅ Export PDF tabellare ed editoriale
- ✅ Password hashate (bcrypt)
- ✅ NO bug del cursore nei campi testo

---

## 🏗️ **Architettura e Data Model**

### **Struttura Dati (localStorage):**

```javascript
COLLABORATORI: {
  id: string (timestamp)
  nome: string
  passwordHash: string (bcrypt)
  colore: string (hex)
}

PROGETTI: {
  id: string (timestamp)
  titolo: string
  sottotitolo: string
  dataInizio: string (ISO date)
  dataFine: string (ISO date)
}

ATTIVITÀ: {
  id: string (timestamp)
  progettoId: string
  collaboratoreId: string
  testo: string
  dataInserimento: string (ISO datetime)
}
```

### **File Structure:**
```
project-tracker-app/
├── pages/
│   ├── _app.js           # Wrapper principale
│   ├── index.js          # Home con 3 accessi
│   ├── admin.js          # Pannello admin
│   ├── collaboratore.js  # Pannello collaboratore
│   └── dashboard.js      # Dashboard + export
├── utils/
│   ├── storage.js        # Gestione localStorage
│   └── pdfGenerator.js   # Export PDF
├── styles/
│   └── globals.css       # Stili globali
├── package.json
├── next.config.js
└── README.md
```

---

## 🚀 **Guida Passo-Passo: Test in Locale**

### **Opzione 1: Usa StackBlitz (SENZA installare nulla)**

1. Vai su **stackblitz.com**
2. Clicca su **"New Project"** → **"Next.js"**
3. Una volta aperto l'editor:
   - Cancella tutti i file esistenti
   - Copia e incolla tutti i file di questa app (uno per uno)
   - Rispetta la struttura delle cartelle
4. StackBlitz installerà automaticamente le dipendenze
5. L'anteprima partirà in automatico a destra
6. Clicca su **"Open in New Tab"** per testare l'app

### **Opzione 2: Usa CodeSandbox (SENZA installare nulla)**

1. Vai su **codesandbox.io**
2. Clicca su **"Create Sandbox"** → **"Next.js"**
3. Importa tutti i file dell'app
4. L'anteprima partirà automaticamente

---

## 🌐 **Guida Passo-Passo: Deploy Online (GitHub + Vercel + Supabase)**

### **FASE 1: Carica il Codice su GitHub (interfaccia web)**

1. Vai su **github.com** e fai login
2. Clicca sul pulsante **"+"** in alto a destra → **"New repository"**
3. Compila:
   - **Repository name**: `project-tracker-app`
   - **Description**: `App gestione progetti e attività`
   - Seleziona **Public**
   - ✅ Spunta **"Add a README file"**
4. Clicca su **"Create repository"**
5. Una volta creato il repository, clicca su **"Add file"** → **"Upload files"**
6. Trascina TUTTI i file dell'app nella finestra (o clicca "choose your files")
7. Scrivi un messaggio tipo: `"Initial commit - app completa"`
8. Clicca su **"Commit changes"**

✅ **Fatto!** Il codice è su GitHub.

---

### **FASE 2: Deploy su Vercel (hosting gratuito)**

1. Vai su **vercel.com** e clicca su **"Sign Up"**
2. Scegli **"Continue with GitHub"** per collegare il tuo account
3. Una volta loggato, clicca su **"Add New..."** → **"Project"**
4. Vercel ti mostrerà tutti i tuoi repository GitHub
5. Trova **`project-tracker-app`** e clicca su **"Import"**
6. Nella schermata di configurazione:
   - **Framework Preset**: Next.js (dovrebbe essere già selezionato)
   - **Root Directory**: lascia `./`
   - **Build Command**: lascia `npm run build`
   - **Output Directory**: lascia `.next`
7. Clicca su **"Deploy"**
8. Aspetta 2-3 minuti... Vercel installerà le dipendenze e builderà l'app
9. Quando vedi **"Congratulations!"**, clicca sul link che appare (tipo `project-tracker-app.vercel.app`)

✅ **L'app è online!** Ma usa ancora localStorage (i dati non sono persistenti tra sessioni).

---

### **FASE 3: Crea Database su Supabase**

1. Vai su **supabase.com** e clicca su **"Start your project"**
2. Fai login con GitHub
3. Clicca su **"New project"**
4. Compila:
   - **Name**: `project-tracker`
   - **Database Password**: inventa una password (SALVALA!)
   - **Region**: scegli quello più vicino (es. Europe West)
5. Clicca su **"Create new project"**
6. Aspetta 2 minuti... Supabase sta preparando il database

#### **Crea le Tabelle:**

7. Una volta pronto, clicca su **"Table Editor"** nella sidebar sinistra
8. Clicca su **"New table"** e crea queste 3 tabelle:

**TABELLA 1: collaboratori**
- Clicca **"New table"**
- Name: `collaboratori`
- Columns (aggiungi queste colonne):
  - `id` → tipo `uuid` → Default value: `gen_random_uuid()` → Primary Key ✅
  - `nome` → tipo `text`
  - `password_hash` → tipo `text`
  - `colore` → tipo `text`
  - `created_at` → tipo `timestamptz` → Default: `now()`
- Clicca **"Save"**

**TABELLA 2: progetti**
- Clicca **"New table"**
- Name: `progetti`
- Columns:
  - `id` → tipo `uuid` → Default: `gen_random_uuid()` → Primary Key ✅
  - `titolo` → tipo `text`
  - `sottotitolo` → tipo `text`
  - `data_inizio` → tipo `date`
  - `data_fine` → tipo `date`
  - `created_at` → tipo `timestamptz` → Default: `now()`
- Clicca **"Save"**

**TABELLA 3: attivita**
- Clicca **"New table"**
- Name: `attivita`
- Columns:
  - `id` → tipo `uuid` → Default: `gen_random_uuid()` → Primary Key ✅
  - `progetto_id` → tipo `uuid` → Foreign key: `progetti.id`
  - `collaboratore_id` → tipo `uuid` → Foreign key: `collaboratori.id`
  - `testo` → tipo `text`
  - `data_inserimento` → tipo `timestamptz` → Default: `now()`
- Clicca **"Save"**

#### **Configura Policy di Accesso:**

9. Clicca su **"Authentication"** → **"Policies"**
10. Per ognuna delle 3 tabelle:
    - Clicca sul nome della tabella
    - Clicca **"New Policy"**
    - Seleziona **"Enable read access for all users"**
    - Fai lo stesso per **"Enable insert access"**, **"Enable update access"**, **"Enable delete access"**
    
(Questo permette accesso completo per testare - per production dovresti configurare policy più restrittive)

#### **Ottieni le Chiavi API:**

11. Clicca su **"Settings"** (⚙️ in basso a sinistra) → **"API"**
12. Copia queste 2 chiavi (SALVALE in un file di testo):
    - **Project URL** (tipo: `https://xxxxx.supabase.co`)
    - **anon public** (chiave molto lunga che inizia con `eyJ...`)

✅ **Database pronto!**

---

### **FASE 4: Collega Supabase a Vercel (variabili d'ambiente)**

1. Torna su **vercel.com** e vai al tuo progetto
2. Clicca su **"Settings"** (in alto)
3. Clicca su **"Environment Variables"** nella sidebar sinistra
4. Aggiungi queste variabili (una per una):

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | (incolla il Project URL di Supabase) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (incolla la chiave anon public) |
| `ADMIN_PASSWORD` | `ses2026` |
| `DASHBOARD_PASSWORD` | `annamaria123` |

5. Per ogni variabile:
   - Clicca **"Add"**
   - Incolla il valore
   - Seleziona tutti gli environment (Production, Preview, Development)
   - Clicca **"Save"**

✅ **Variabili configurate!**

---

### **FASE 5: Modifica il Codice per Usare Supabase**

Ora devi modificare il file `utils/storage.js` per usare Supabase invece di localStorage.

#### **A) Installa il Client Supabase**

1. Torna su GitHub → il tuo repository
2. Apri il file `package.json`
3. Clicca sull'icona della matita (✏️ Edit)
4. Aggiungi questa riga dentro `"dependencies"`:
```json
"@supabase/supabase-js": "^2.39.0",
```
5. Clicca **"Commit changes"**

#### **B) Crea il file per inizializzare Supabase**

1. Su GitHub, nel tuo repository, clicca **"Add file"** → **"Create new file"**
2. Nome file: `utils/supabaseClient.js`
3. Incolla questo codice:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

4. Clicca **"Commit new file"**

#### **C) Modifica `utils/storage.js`**

Questa è la parte più complessa. Devi sostituire TUTTE le funzioni in `storage.js` per usare Supabase.

📎 **TI FORNIRÒ IL FILE COMPLETO** `storage-supabase.js` in un prossimo messaggio - dovrai sostituire completamente il file `utils/storage.js` con quello nuovo.

---

### **FASE 6: Re-deploy**

1. Torna su **Vercel** → il tuo progetto
2. Vercel rileverà automaticamente le modifiche su GitHub
3. Partirà un nuovo deploy automatico
4. Aspetta 2-3 minuti
5. Clicca sul nuovo link per testare

✅ **APP ONLINE CON SUPABASE!**

---

## 🐛 **Per Evitare il Bug del Cursore**

### **Cosa abbiamo fatto nel codice:**

1. **Controlled Inputs Stabili**
   - Ogni input ha uno stato dedicato (`value` + `onChange`)
   - NON usiamo mai input "uncontrolled"

2. **State Separato per Ogni Campo**
   - Esempio: `nuovoTestoPerProgetto` è un oggetto con chiavi per ogni progetto
   - Così il cambiamento di UN progetto non causa re-render degli altri

3. **Nessun Re-render Durante Digitazione**
   - Usiamo `useCallback` per funzioni che caricano dati
   - Non facciamo chiamate API durante `onChange`

4. **Key Props Stabili**
   - Usiamo sempre `id` univoci come `key` (mai index)
   - Esempio: `key={progetto.id}` (non `key={index}`)

### **Errori da EVITARE:**

❌ **NON fare questo:**
```javascript
// BAD: crea un nuovo oggetto ad ogni render
value={getValore()}
```

✅ **Fai questo:**
```javascript
// GOOD: usa una variabile stabile
const valore = getValore();
...
value={valore}
```

❌ **NON fare questo:**
```javascript
// BAD: chiama API durante onChange
onChange={(e) => { 
  setValue(e.target.value);
  fetchData(); // ❌ causa re-render
}}
```

✅ **Fai questo:**
```javascript
// GOOD: salva solo il valore
onChange={(e) => setValue(e.target.value)}
```

---

## 🎨 **Personalizzazioni Possibili**

- Cambia i colori in `globals.css`
- Modifica le password in `utils/storage.js` (ricorda di usare `bcrypt.hashSync()`)
- Aggiungi nuovi campi nei form
- Personalizza il layout della Dashboard

---

## 📝 **Note Importanti**

- Le password sono **sempre hashate** (bcrypt) - mai in chiaro
- localStorage funziona SOLO in locale (i dati si cancellano chiudendo il browser)
- Con Supabase i dati sono **persistenti** e accessibili da qualsiasi dispositivo
- L'app è ottimizzata per **zero bug del cursore** durante la digitazione

---

## 🆘 **Problemi Comuni**

**Problema:** L'app non parte su StackBlitz
→ Soluzione: Controlla che tutti i file siano nella cartella giusta

**Problema:** "Module not found: bcryptjs"
→ Soluzione: Assicurati che `package.json` contenga tutte le dipendenze

**Problema:** PDF non si scarica
→ Soluzione: Controlla la console del browser (F12) per errori

**Problema:** Vercel build fallisce
→ Soluzione: Controlla i log su Vercel, spesso è un problema di sintassi

---

💡 **Hai bisogno di aiuto?** Contattami!
