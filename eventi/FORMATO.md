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

## Contratti e Ambizioni (contratti.js)
- Le fazioni con basi offrono contratti dallo stato della mappa: **prendere** un punto nemico debole, **ripulire** una tana, **difendere** un punto verso cui marcia una squadra nemica (bisogna esserci quando arriva: conti come +4 di forza), **rifornire** un presidio debole (3 cibo o 2 scatole di munizioni). Linguetta Zona → «Contratti». Paga, Rapporto +1 col committente (−1 con chi ci perde), +1 PE; fallire o rinunciare: Rapporto −1. Banditi e Mercenari offrono solo con Rapporto 1+.
- **Ambizioni** (in cima a Storie, solo quando la trama è spenta): la Guida (Nome), il Ricco (rubli), il Cartografo (punti visitati), il Soldato di ventura (contratti), il Cronista (missioni concluse). Quattro traguardi, +2/+3/+4/+6 PE, epilogo nel diario. Stato in `stato/main.al` (`ctr`, `vis`, `cfatti`, `amb`, `ambl`).
- Storie nuove: `eventi/punti.json` (26, legate al tipo di punto e a chi lo controlla) e `eventi/nord2.json` (14, zone del nord).

## Reclute, ruoli e storie personali (reclute.js)
- Nei rifugi, nelle basi e dai mercanti amici (Stalker liberi o fazioni con Rapporto 1+) ogni giorno possono cercare lavoro 0–2 reclute, valide 3 giorni. Linguetta Gruppo → «Reclute». Si ingaggiano sul posto: ingaggio = 3 giorni di paga.
- Ogni recluta ha provenienza, passato, due tratti (`RC_TR`), dado, Morale, slot e paga. Ruoli: scorta, esploratore (ogni giorno scopre un punto e porta una voce), meccanico (toglie un segno d'usura), medico (−1 Ferite), cuoco (−1 Fatica, −1 Nervi), guardia (resta nel punto). Col tratto adatto o con la dote l'effetto raddoppia.
- Storia personale: uno dei 16 schemi di `RQ`, tre tappe in tre punti della mappa scelti all'ingaggio. La prima tappa si apre con fiducia 1+ o dopo 3 giorni. Le tappe diventano storie del motore (`rq-<id>-<n>`), con la recluta nel gruppo. Alla fine: fiducia +2 e una dote (`png.dote`). Se la storia resta ferma 10 giorni, la fiducia cala; a −2 la recluta se ne va. Stato in `png.rq` {q, p: [punti], x, st, last}.

## La base (base.js)
- Un rifugio, bunker, fattoria, accampamento o deposito vuoto diventa la base con 5.000 ₽ e 4 ore (Zona → «La base»). Sulla mappa è della fazione «La tua gente», ostile a banditi, Monolite e mutanti, e a chi ha Rapporto −2 o peggio con te.
- Stanze (`BS_ST`): brande e stufa, officina, infermeria, deposito (nascondiglio sicuro), radio (contratti in più, avvisi degli attacchi), orto, serra, sacchi di sabbia, mitragliatrice fissa, campo minato. Un cantiere alla volta: 1 giorno di lavoro al giorno, +½ per guardia (+1 con Mani d'oro), +1 se ci sei.
- Presidio = 1 + 2 per guardia + difese + 3 e il gruppo se ci sei + BRDM parcheggiato. Le guardie mangiano 1 cibo al giorno dalle scorte della base; d'inverno la stufa brucia 1 combustibile. Senza, la fiducia cala.
- Se l'A-Life prende la base, una stanza va distrutta e le guardie muoiono o scappano. Si riprende con lo Scontro, «L'ho ripulito» e «Riprendi la base». Stato in `stato/main.al.base`.
- Condizione nuova nelle storie: `base` (true = sei alla base; o il nome di una stanza che deve esserci). Esito: `basesc` {cibo, comb}.

## Armi pesanti, mezzi, elicotteri (mezzi.js)
- Listino: PKP «Pečeneg», RPG-7, razzi PG-7V e OG-7V, tanica di benzina. Gruppo «Armi pesanti» in Armeria; nello Scontro si tirano con Forza + Armi pesanti.
- Mezzi (`MZ_V`): Niva, UAZ-469, ZIL-131, BRDM-2 (+ KPVT ai Magazzini). Si comprano al Bar, ai Magazzini (Libertà 1+), allo Skadovsk, al Cordone (Mercante 2+). Col mezzo «con te», il viaggio («Arrivato» o a tappe) dura la metà se il percorso evita Foresta Rossa, Pripjat' e centrale (il BRDM passa nella Foresta); consuma combustibile (ogni 2 ore il consumo del mezzo), Allerta +2 (+3 ZIL e BRDM), può guastarsi. Incustodito può essere rubato: garage (300 ₽/giorno) o officina della base. Stato in `stato/main.al.mz`.
- Elicotteri: l'Esercito manda ogni tanto un Mi-24 (pattuglia) o un Mi-8 (sbarca una squadra). Se è nella tua zona e sei fuori dalla base con Allerta alta o col mezzo, parte la storia. Con l'RPG si abbattono (Rapporto Esercito −3).
- Condizioni nuove: `heli` (true, "Mi-24", "Mi-8"), `mezzo`. Esiti: `abbatti`, `viaheli`, `mezzoseg`. Storie in `eventi/mezzi.json` (10).

## La Zona viva, seconda parte (vivo.js, reclute2.js)
- Persone con un nome (non nel gruppo, non mercanti, Barman o scienziati) hanno un punto (`png.poi`) e ogni giorno possono spostarsi: nella zona o, a volte, in quella accanto. Nella campagna con la trama si muovono solo quelle con `vaga: true`. Sulla mappa, toccando un punto, si vede chi c'è; nella linguetta Zona, «Qui ci sono».
- Squadre in marcia e elicotteri sono disegnati sulla mappa (triangolo del colore della fazione; avvicinandosi, chi sono e dove vanno).
- Scontro: col mezzo «con te» il gruppo ha riparo leggero (riparo pesante col BRDM); la KPVT entra come combattente. L'OG-7V colpisce fino ad altri 3 bersagli con le schegge. Vincendo uno Scontro in un punto, il contratto «prendi» o «ripulisci» lì si chiude da solo, e un punto tenuto da nemici diventa vuoto.
- Armi pesanti in mano o addosso: −1 Mobilità automatico.
- Mezzi: limite di posti (se il gruppo non ci sta, si va a piedi); bagagliaio come nascondiglio che viaggia col mezzo (si perde se il mezzo viene rubato); sovraccarico = più usura.
- Dialoghi coi modelli: sanno dove sei, chi tiene il punto, chi c'è nel gruppo, mezzo, base e voci recenti.
- 4 storie personali nuove (trattoria, orologio del padre, l'inseguito, i quadri della Zona); il passato della recluta suggerisce la sua storia nel 65% dei casi.
- Equilibrio A-Life: rinforzi da fuori per le fazioni ridotte a pochi punti; l'Esercito resta nelle sue zone; banditi e scienziati più resistenti. Tempi di calcolo ridotti di circa 8 volte (memoria dei percorsi).

## Persone vive, rete viva, dialoghi offline (anime.js, rete2.js, dialoghi.js)
- Ogni persona (`stato/main.an.p[id]`) ha due tratti di carattere (`AN_CAR`, 16), un bisogno (`AN_BIS`), un segreto (`AN_SEG`, `sv`: 0 ignoto, 1 voce, 2 saputo), opinioni sugli altri (`op`, da −3 a +3), ricordi di te (`mem`), umore, ricchezza. In sandbox nasce un cast di 40 stalker sparsi per la Zona (`png.cast`); arrivano novellini quando scendono sotto 36.
- Vita quotidiana: amicizie, liti tra nemici (a volte mortali, con segreti che nascono), morti nella Zona, artefatti, chi esce, chi sparisce (si può trovare andando nel punto giusto), chi cambia bandiera, debiti restituiti o no. Ogni fatto va in `an.fatti` e sulla rete.
- Passaparola: quello che fai a uno lo sanno i suoi amici e i suoi nemici; storie, contratti e Scontri cambiano fiducia e ricordi.
- Rete (`stato/main.rt`): Rete → Canale. Discussioni con autori veri e risposte nelle ore seguenti; lutti, voci (vere o false), mappa, aiuto, mercato, fazioni, domande, discorsi su di te. Il carattere cambia il modo di scrivere. Tu puoi pubblicare, vantarti, chiedere notizie, insultare una fazione, rispondere (gentile, ironico, duro). Taglie su di te (agguati) e su altri (cacciatori, o la vendetta di chi sopravvive).
- Dialoghi offline: «Parla» nella linguetta Zona (chi è nel punto), nel Gruppo e in Rete → Persone («Scrivigli» a distanza). Argomenti: come sta, voci, opinioni sugli altri, chi è, segreti (Empatia + Persuasione), aiuto per il suo bisogno (prestito, consegna, vendetta o farla finita, ricerca), ricatto o silenzio, ingaggio, regolamento di conti (Scontro).
- Drammi nel gruppo, ogni tanto la notte: liti, richieste di paga, nostalgia di casa, soldi spariti, notti buone.
- Prestazioni: nella versione offline salvataggi e ridisegni sono raggruppati (un giorno di gioco su un telefono lento: da 2,7 s a 0,13 s).
