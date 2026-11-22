# PDA della Zona

Il palmare dello stalker per una campagna in solitario nella Zona di esclusione (2012): scheda a gradini, zaino con usura e accessori, salute per parti del corpo, gruppo, rete e radio, mappa, oracolo, e un motore di storie che fa vivere la Zona da solo.

- **Gioca:** apri la pagina di GitHub Pages del repository e installala come app (Chrome/Edge: menu → «Installa app»). Funziona offline.
- **Salvataggi:** restano nel browser. Linguetta *Sistema* → «Salva su file» / «Carica da file».
- **Col GM (Claude):** si gioca anche nel PDA dentro claude.ai; si passa da una parte all'altra col file di salvataggio.
- **Dialoghi liberi coi PNG (facoltativo):** linguetta *Sistema* → modello Claude, GPT o Gemini con la tua chiave API. La chiave resta solo nel browser.

## Le storie
Gli eventi sono in `eventi/*.json`: condizioni (`se`), testo, scelte con tiri a gradini, esiti. Il formato è descritto in `eventi/FORMATO.md`.

## Crediti
Mappa: Sentinel-2 cloudless 2020 di EOX IT Services GmbH (contiene dati Copernicus Sentinel modificati, 2020), CC BY-NC-SA 4.0. Foto delle armi: Wikimedia Commons. Progetto personale non commerciale ispirato all'universo di S.T.A.L.K.E.R. (GSC Game World), che non è collegato a questo progetto.

## Scaricare e giocare

- **PC:** scarica `dist/PDA-Zona.html` e aprilo con doppio clic (Chrome, Edge o Firefox). È un file solo, funziona senza internet. Salva nel browser: per spostare la partita usa Sistema → «Salva su file» / «Carica da file».
- **Telefono:** apri https://ndassistip-sketch.github.io/Zona-pda/ e scegli «Aggiungi alla schermata Home» (iPhone: Condividi → Aggiungi alla schermata Home; Android: menu ⋮ → Installa app). Dopo la prima apertura funziona anche offline.
- Per rifare il file per il PC dopo una modifica: `python3 tools/bundle.py`.
