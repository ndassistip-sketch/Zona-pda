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
