# Come si scrive una storia

Ogni file in `eventi/` è `{"pacchetto":"Nome","eventi":[ … ]}`. Per caricare un file nuovo, aggiungilo a `EVP` in `motore.js` (e a `FILES` in `sw.js` per l'offline).

```json
{"id":"cor-esempio","titolo":"Titolo","tono":"calmo|guaio","peso":10,"ripeti":24,
 "se":{"luogo":"Cordone","ore":[18,23]},
 "testo":["variante 1","variante 2"],
 "scelte":[
  {"t":"Cosa fai","tiro":"empatia+persuasione","spec":"Contrattare","passi":0,
   "ok":{"testo":"…","rubli":500},"ko":{"testo":"…","tr":{"nervi":1}}},
  {"t":"Altra scelta senza tiro","se":{"oggetto":"Benda"},"esito":{"testo":"…","togli":"Benda"}}]}
```

- **ripeti**: ore prima che possa tornare (`"mai"` = una volta sola). **solo_seguito**: esce solo come seguito di un'altra storia.
- **se** (condizioni, tutte vere): `luogo` (zona o lista, `"*"` ovunque), `ore` [da, a) anche a cavallo della mezzanotte, `stagione`, `meteo` (parole), `emiss` [min,max], `tensione` [min,max], `flag` / `noflag`, `oggetto` / `senza`, `png` (vivo, per nome o parte del nome), `gruppo` (con te), `rubli` minimi, `nome` minimo, `rapporto` {fazione: minimo}, `traccia` {nome:[min,max]}.
- **tiro**: `caratteristica+abilità` (forza, agilita, intelletto, empatia, sf; abilità come nella scheda). `ok` con 1+ successi (`min` per cambiarlo), `ottimo` con 2+, `ko` con 0 (e +1 PE).
- **esiti**: `testo`, `tr` {traccia: ±}, `rubli`, `pe`, `nome`, `rap` {fazione: ±}, `fid` {persona: ±}, `flag`, `noflag`, `emiss`, `tensione`, `allerta`, `oggetto` (nome del listino, o {n, qta, stato, nota, colpi}), `togli`, `scorte` {cibo, acqua, comb}, `msg` {da, testo}, `radio` {canale, da, testo}, `lavoro` {titolo, da, testo, paga, dim, giorni}, `png` {nome, fazione, nota, fiducia}, `pngstato`, `gruppo` {persona: true/false}, `seguito` (id) + `dopo` (minuti), `colpo` {D, P}, `tempo` (minuti).
- Nei testi: `{io}` il soprannome, `{luogo}`, `{stalker}` un nome a caso, `{png:Kostja}` il nome completo.

## Punti d'interesse e A-Life (alife.js)
- Ogni zona ha 20 punti (`AL_RAW` in `alife.js`: `nome~tipo~fazione`, `*` = principale). Il controllo cambia da solo: le fazioni mandano squadre, i mutanti fanno tane, le basi richiamano gente, l'Emissione falcia chi è in marcia. Stato in `stato/main.al`.
- Condizioni nuove in `se`: `poi` (nome o parte del nome del punto dove sei), `tipo` (base, mercante, rifugio, campo di anomalie, tana, rovine, posto di blocco, laboratorio, deposito, ferrovia, fattoria, bunker, accampamento, luogo selvaggio), `controllo` (fazione che tiene il punto dove sei, o `"vuoto"`), `ctl` {punto: fazione}.
- Esiti nuovi: `prendi` {poi, f, forza} (cambia chi tiene un punto; `f` vuoto = ripulito), `vai` (sposta il personaggio su un punto).
- Arrivando a un punto («Vai» nella linguetta Zona o sulla mappa) escono prima le storie con quel `poi`. Le missioni sono in `eventi/quest-sud.json` e `eventi/quest-nord.json` (20 linee, 3 tappe ciascuna, segni `qNN-1`, `qNN-2`, `qNN-fine`).
