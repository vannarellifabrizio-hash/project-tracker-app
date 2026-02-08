# 🚀 GUIDA RAPIDA - Start in 5 Minuti

## ✨ **Metodo VELOCE: Usa StackBlitz (ZERO installazioni)**

### **Passo 1: Apri StackBlitz**
1. Vai su → **stackblitz.com**
2. Clicca su → **"New Project"**
3. Scegli → **"Next.js"**

### **Passo 2: Copia i File**
1. Cancella tutti i file esistenti
2. Crea la stessa struttura di cartelle:
   ```
   - pages/
   - utils/
   - styles/
   ```
3. Copia e incolla TUTTI i file uno per uno

### **Passo 3: Testa l'App**
- L'anteprima partirà automaticamente a destra
- Clicca su **"Open in New Tab"** per testarla meglio

✅ **FATTO!** L'app funziona in anteprima.

---

## 🌐 **Per Metterla Online (30 minuti)**

### **Step 1: GitHub (5 min)**
1. Vai su **github.com** → Login
2. Clicca **"+"** → **"New repository"**
3. Nome: `project-tracker-app`
4. Clicca **"Create repository"**
5. Clicca **"Upload files"** → Trascina TUTTI i file
6. Clicca **"Commit changes"**

### **Step 2: Vercel (5 min)**
1. Vai su **vercel.com** → **"Sign up with GitHub"**
2. Clicca **"New Project"**
3. Seleziona il repository **`project-tracker-app`**
4. Clicca **"Deploy"**
5. Aspetta 2 minuti → L'app è online! 🎉

⚠️ **A questo punto i dati NON sono persistenti** (usa localStorage locale)

---

### **Step 3: Supabase - Database Online (15 min)**

#### **3.1 - Crea Progetto**
1. Vai su **supabase.com** → Login con GitHub
2. **"New project"**
3. Nome: `project-tracker`
4. Crea una password (SALVALA!)
5. Aspetta 2 minuti

#### **3.2 - Crea Tabelle**
1. Clicca **"Table Editor"**
2. Crea 3 tabelle (clicca "New table" per ognuna):

**TABELLA 1: `collaboratori`**
```
id → uuid → gen_random_uuid() → Primary Key ✅
nome → text
password_hash → text
colore → text
created_at → timestamptz → now()
```

**TABELLA 2: `progetti`**
```
id → uuid → gen_random_uuid() → Primary Key ✅
titolo → text
sottotitolo → text
data_inizio → date
data_fine → date
created_at → timestamptz → now()
```

**TABELLA 3: `attivita`**
```
id → uuid → gen_random_uuid() → Primary Key ✅
progetto_id → uuid → Foreign key: progetti.id
collaboratore_id → uuid → Foreign key: collaboratori.id
testo → text
data_inserimento → timestamptz → now()
```

#### **3.3 - Abilita Accesso**
1. Clicca **"Authentication"** → **"Policies"**
2. Per ogni tabella: abilita tutte le policy (read, insert, update, delete)

#### **3.4 - Copia Chiavi**
1. Clicca **"Settings"** → **"API"**
2. Copia:
   - **Project URL** (es: https://xxxxx.supabase.co)
   - **anon public** (chiave lunga)

---

### **Step 4: Collega Vercel a Supabase (5 min)**

1. Torna su **Vercel** → il tuo progetto
2. **"Settings"** → **"Environment Variables"**
3. Aggiungi queste variabili:

| Nome | Valore |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | (il Project URL) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (la chiave anon) |
| `ADMIN_PASSWORD` | `ses2026` |
| `DASHBOARD_PASSWORD` | `annamaria123` |

4. Seleziona **Production, Preview, Development** per tutte
5. Clicca **"Save"** per ognuna

---

### **Step 5: Aggiorna il Codice (5 min)**

1. Su **GitHub** → apri `package.json`
2. Clicca sull'icona **✏️ Edit**
3. Aggiungi dentro `"dependencies"`:
```json
"@supabase/supabase-js": "^2.39.0",
```
4. Commit

5. Crea nuovo file: `utils/supabaseClient.js`
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

6. **SOSTITUISCI** il file `utils/storage.js` con il contenuto di `utils/storage-supabase.js`

7. Vercel farà automaticamente un nuovo deploy

---

## ✅ **FINITO!**

L'app è online con database persistente! 🎉

**Link utili:**
- La tua app: `https://tuoprogetto.vercel.app`
- Dashboard Vercel: `vercel.com/dashboard`
- Dashboard Supabase: `supabase.com/dashboard`

---

## 🆘 **Problemi?**

**L'app non parte su StackBlitz:**
→ Controlla di aver copiato TUTTI i file nella struttura corretta

**Vercel dice "Build Failed":**
→ Clicca su "View Logs" e leggi l'errore (di solito è un errore di sintassi)

**Supabase non salva i dati:**
→ Controlla le Policy (devono essere tutte abilitate)

**Le variabili d'ambiente non funzionano:**
→ Dopo averle aggiunte su Vercel, devi fare un nuovo deploy (vai su "Deployments" → "..." → "Redeploy")

---

💡 **Tip:** Testa prima tutto in locale con localStorage, poi passa a Supabase!
