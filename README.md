# Lenskow Lernspiele

Zwölf liebevoll gestaltete Lernspiele für Kinder ab etwa 5 Jahren – als Web-App,
die sich auf Tablet und Handy installieren lässt und danach auch offline läuft.

**Live:** https://spiele.fredie.io

## Grundideen

- **Kein Lesen nötig:** Eine freundliche Eule liest jede Aufgabe vor. Tippt das Kind
  auf die Eule, hört es die Aufgabe noch einmal. Alle Ansagen sind vorab mit einer
  natürlichen deutschen Stimme aufgenommen (funktioniert offline und auf jedem Gerät).
- **Fehler sind erlaubt:** Keine Zeitlimits, keine Strafpunkte. Bei einem Fehler gibt es
  eine sanfte Rückmeldung, nach dem zweiten Fehlversuch einen sichtbaren Tipp.
- **Wächst mit:** Jedes Spiel hat drei Stufen. Klappt eine Runde fast fehlerfrei, wird es
  etwas schwerer, bei vielen Fehlern wieder leichter (im Elternbereich auch fest einstellbar).
- **Belohnung:** Jede geschaffte Runde bringt einen Sticker ins Stickerheft (58 Sticker).
- **Große, klare Bedienelemente** für Kinderhände; Tippen *und* Ziehen funktioniert.
- **Keine Werbung, keine Anmeldung, keine Datenübertragung.** Fortschritt und Bilder
  bleiben im Browser des Geräts.

## Die Spiele

| Bereich | Spiel | Was geübt wird |
| --- | --- | --- |
| Zahlen & Mengen | **Tiere füttern** | Eine gewünschte Anzahl Futter auf den Teller legen – Zählen, Eins-zu-eins-Zuordnung, Mengen bilden (bis 5 / 8 / 10) |
| | **Wie viele?** | Mengen abzählen und Würfelbilder erkennen, Ziffern 1–10 zuordnen; Bilder antippen zählt laut mit |
| | **Punkt zu Punkt** | Zahlenreihe bis 7 / 10 / 17, dabei entsteht ein Bild |
| Sprache & Laute | **Erste Laute** | Anlaute hören („Was fängt an wie Maus?“), Buchstabe wird mitgezeigt |
| | **Reime** | Reimwörter erkennen („Was reimt sich auf Maus?“) |
| Denken & Sehen | **Muster** | Muster fortsetzen (AB, AAB, ABC, AABB, Lücke in der Reihe …) |
| | **Was passt nicht?** | Oberbegriffe bilden: Tiere, Obst, Farben, „kann fliegen“ … |
| | **Schatten** | Bilder auf den passenden Schatten ziehen – Formwahrnehmung |
| Merken & Hören | **Memory** | 6, 8 oder 12 Karten, jedes Bild wird benannt |
| | **Melodie** | Tonfolgen nachspielen – Hörgedächtnis |
| Geschick & Kreativität | **Labyrinth** | Mit dem Finger den Weg finden |
| | **Malen** | Freies Malen mit Regenbogenpinsel und Stempeln, Bilder aufheben |

Der **Elternbereich** (Zahnrad oben rechts, geschützt durch eine kleine Zahlen-Abfrage)
erklärt jedes Spiel, zeigt den Fortschritt und erlaubt, Stufen, Sprache und Geräusche
einzustellen.

## Entwicklung

```bash
npm install
npm run dev       # Entwicklungsserver
npm test          # Inhalte, Bilder, Spiellogik und Sprachaufnahmen prüfen
npm run build     # Produktionsbuild nach dist/
```

Technik: Vite, reines JavaScript ohne Framework, PWA über `vite-plugin-pwa`.
Bei jedem Push auf `main` wird automatisch auf GitHub Pages veröffentlicht.

### Aufbau

```
src/
  core/        Ton, Sprache, Speicherstand, Navigation, Spielrahmen, Effekte
  screens/     Startbild, Startbildschirm, Stickerheft, Elternbereich
  games/       ein Modul pro Spiel (+ logic.js mit der reinen Spiellogik)
  data/        Wortschatz, Spielinhalte und alle gesprochenen Texte
public/
  e/           Bilder (Noto-Emoji als SVG)
  voice/       Sprachaufnahmen (MP3)
scripts/       Hilfsskripte für Bilder und Sprachaufnahmen
tests/         Tests (node:test)
```

### Neue Wörter oder Sätze hinzufügen

1. Wort in `src/data/words.js` eintragen (Bildname aus den
   [Noto-Emoji bei Iconify](https://icon-sets.iconify.design/noto/)) und in
   `src/data/content.js` verwenden.
2. `npm run emoji` kopiert die benötigten Bilder nach `public/e/`.
3. Sprachaufnahmen erzeugen:
   ```bash
   npm run voice:lines
   python3 -m venv .venv-tts && .venv-tts/bin/pip install piper-tts numpy
   # Stimme (CC0) laden: de_DE-thorsten-high.onnx und .onnx.json von
   # https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/thorsten/high
   .venv-tts/bin/python scripts/generate_voice.py --model de_DE-thorsten-high.onnx
   ```
   Vorhandene Aufnahmen werden übersprungen. Fehlt eine Aufnahme, nutzt die App
   ersatzweise die Sprachausgabe des Geräts.
4. `npm test` prüft, ob alles zusammenpasst.

## Lizenzen

- Bilder: [Noto Emoji](https://github.com/googlefonts/noto-emoji) von Google, Apache-Lizenz 2.0
- Schriften: [Fredoka](https://github.com/hafontia/Fredoka-One) und [Andika](https://software.sil.org/andika/), SIL Open Font License 1.1
- Stimme: [Piper](https://github.com/rhasspy/piper) mit der Stimme „Thorsten“ ([Thorsten-Voice](https://github.com/thorstenMueller/Thorsten-Voice), CC0)
