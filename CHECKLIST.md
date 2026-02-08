# ✅ CHECKLIST DEPLOYMENT

Usa questa checklist per assicurarti di non dimenticare nulla durante il deployment.

---

## 📋 **FASE 1: Test Locale**

- [ ] Ho copiato tutti i file nella struttura corretta
- [ ] Ho verificato che `package.json` contiene tutte le dipendenze
- [ ] L'app parte correttamente su StackBlitz/CodeSandbox
- [ ] Riesco ad accedere con le 3 password (admin, dashboard, collaboratore di test)
- [ ] Riesco a creare un collaboratore
- [ ] Riesco a creare un progetto
- [ ] Riesco a inserire un'attività
- [ ] La ricerca progetti funziona
- [ ] I filtri nella dashboard funzionano
- [ ] L'export PDF funziona (tabellare ed editoriale)
- [ ] NON ho bug del cursore quando scrivo nei campi

---

## 📋 **FASE 2: GitHub**

- [ ] Ho creato un account GitHub
- [ ] Ho creato un nuovo repository (`project-tracker-app`)
- [ ] Ho caricato TUTTI i file (inclusi package.json, .gitignore, README.md)
- [ ] Il repository è visibile su GitHub

---

## 📋 **FASE 3: Vercel**

- [ ] Ho creato un account Vercel collegato a GitHub
- [ ] Ho importato il repository `project-tracker-app`
- [ ] Il deploy è completato con successo
- [ ] L'app è accessibile al link fornito da Vercel
- [ ] Ho testato l'accesso (funziona con localStorage)

---

## 📋 **FASE 4: Supabase**

- [ ] Ho creato un account Supabase
- [ ] Ho creato un nuovo progetto (`project-tracker`)
- [ ] Ho salvato la password del database
- [ ] Ho creato la tabella `collaboratori` con tutte le colonne corrette
- [ ] Ho creato la tabella `progetti` con tutte le colonne corrette
- [ ] Ho creato la tabella `attivita` con tutte le colonne corrette
- [ ] Ho configurato le Foreign Keys per `attivita`
- [ ] Ho abilitato tutte le Policy (read, insert, update, delete) per tutte e 3 le tabelle
- [ ] Ho copiato il **Project URL**
- [ ] Ho copiato la chiave **anon public**

---

## 📋 **FASE 5: Variabili d'Ambiente**

- [ ] Su Vercel → Settings → Environment Variables
- [ ] Ho aggiunto `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Ho aggiunto `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Ho aggiunto `ADMIN_PASSWORD` = `ses2026`
- [ ] Ho aggiunto `DASHBOARD_PASSWORD` = `annamaria123`
- [ ] Ho selezionato tutti gli environment (Production, Preview, Development) per tutte
- [ ] Ho salvato tutte le variabili

---

## 📋 **FASE 6: Codice Supabase**

- [ ] Ho aggiunto `"@supabase/supabase-js": "^2.39.0"` in `package.json`
- [ ] Ho creato il file `utils/supabaseClient.js`
- [ ] Ho SOSTITUITO `utils/storage.js` con il contenuto di `utils/storage-supabase.js`
- [ ] Ho fatto commit su GitHub
- [ ] Vercel ha fatto automaticamente un nuovo deploy
- [ ] Il deploy è completato con successo

---

## 📋 **FASE 7: Test Finale**

- [ ] L'app è online e accessibile
- [ ] Riesco ad accedere come Admin
- [ ] Creo un collaboratore → viene salvato nel database Supabase
- [ ] Creo un progetto → viene salvato nel database Supabase
- [ ] Accedo come collaboratore → vedo i progetti
- [ ] Inserisco un'attività → viene salvata nel database
- [ ] Chiudo e riapro l'app → i dati sono ancora lì (persistenti!)
- [ ] Accedo alla Dashboard
- [ ] I filtri funzionano
- [ ] L'export PDF funziona
- [ ] NON ci sono errori nella console del browser (F12)

---

## 🎉 **SE HAI SPUNTATO TUTTO: COMPLIMENTI!**

L'app è pronta per l'uso in produzione! 🚀

---

## 🐛 **Troubleshooting Rapido**

**Build fallisce su Vercel:**
1. Vai su Vercel → Deployments → Clicca sul deploy fallito → "View Logs"
2. Cerca la riga con "error" o "failed"
3. Di solito è un errore di sintassi o una dipendenza mancante

**Supabase non salva i dati:**
1. Vai su Supabase → Table Editor → Clicca sulla tabella
2. Prova a inserire una riga manualmente
3. Se non funziona → problema di Policy
4. Vai su Authentication → Policies → Abilita tutto

**Le variabili d'ambiente non vengono lette:**
1. Verifica di averle scritte correttamente (maiuscole/minuscole)
2. Dopo averle aggiunte, devi fare un NUOVO DEPLOY
3. Vai su Vercel → Deployments → "..." → "Redeploy"

**L'app usa ancora localStorage invece di Supabase:**
1. Hai sostituito `utils/storage.js` con il codice di `storage-supabase.js`?
2. Hai fatto commit su GitHub?
3. Vercel ha fatto un nuovo deploy?
4. Controlla che non ci siano errori nella console del browser

---

## 📞 **Serve Aiuto?**

Se qualcosa non funziona:
1. Controlla questa checklist
2. Leggi il README.md (sezione "Problemi Comuni")
3. Leggi la GUIDA_RAPIDA.md
4. Controlla i log di Vercel (se il build fallisce)
5. Controlla la console del browser (F12) per errori JavaScript

---

💡 **Pro Tip:** Testa sempre prima in locale, poi su Vercel, poi con Supabase!
