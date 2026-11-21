#!/usr/bin/env python3
"""
Erzeugt die Sprachaufnahmen (public/voice/<key>.mp3) mit Piper TTS.

Voraussetzungen (einmalig):
  python3 -m venv .venv-tts && .venv-tts/bin/pip install piper-tts numpy
  Stimme laden (CC0): de_DE-thorsten-high.onnx + .onnx.json von
  https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/thorsten/high
  ffmpeg muss installiert sein.

Ablauf:
  npm run voice:lines                       # Sätze sammeln
  .venv-tts/bin/python scripts/generate_voice.py --model pfad/de_DE-thorsten-high.onnx

Bereits vorhandene Dateien werden übersprungen (--force erzeugt alles neu).
Nicht mehr benötigte Dateien werden gelöscht. Danach wird
src/data/voice-manifest.json aktualisiert.
"""
import argparse
import io
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent

# Aussprache-Hilfen: Anzeige-Text → gesprochener Text (nur für die Sprachsynthese)
PRONUNCIATION = {
    "Puzzle": "Pazzel",
    "Handy": "Händi",
    "Baby": "Beebi",
    "Donut": "Dounat",
    "Muffin": "Maffin",
    "T-Shirt": "Tie-Schört",
    "Los geht’s!": "Los gehts!",
}

# Wortersetzungen innerhalb längerer Sätze
REPLACE = [
    ("’", "'"),
]


def spoken(text: str) -> str:
    if text in PRONUNCIATION:
        return PRONUNCIATION[text]
    for a, b in REPLACE:
        text = text.replace(a, b)
    return text


def trim(audio: np.ndarray, rate: int, threshold=0.012, pad_ms=60) -> np.ndarray:
    """Stille am Anfang und Ende entfernen (schnellere Reaktion in den Spielen)."""
    level = np.abs(audio.astype(np.float32) / 32768.0)
    idx = np.where(level > threshold)[0]
    if len(idx) == 0:
        return audio
    pad = int(rate * pad_ms / 1000)
    start = max(0, idx[0] - pad)
    end = min(len(audio), idx[-1] + pad * 2)
    out = audio[start:end].astype(np.float32)
    # weiche Ein-/Ausblendung gegen Knacken
    fade = min(len(out) // 4, int(rate * 0.012))
    if fade > 0:
        out[:fade] *= np.linspace(0, 1, fade)
        out[-fade:] *= np.linspace(1, 0, fade)
    return out.astype(np.int16)


def synth(voice, cfg, text):
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        voice.synthesize_wav(text, wf, syn_config=cfg)
    buf.seek(0)
    with wave.open(buf, "rb") as wf:
        rate = wf.getframerate()
        frames = wf.readframes(wf.getnframes())
    return np.frombuffer(frames, dtype=np.int16), rate


def encode_mp3(audio: np.ndarray, rate: int, path: Path):
    cmd = [
        "ffmpeg", "-v", "error", "-y",
        "-f", "s16le", "-ar", str(rate), "-ac", "1", "-i", "-",
        "-af", "highpass=f=70,lowpass=f=10000",
        "-codec:a", "libmp3lame", "-b:a", "40k", "-ar", "22050", "-ac", "1",
        str(path),
    ]
    subprocess.run(cmd, input=audio.tobytes(), check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True)
    ap.add_argument("--lines", default=str(ROOT / "scripts" / "voice-lines.json"))
    ap.add_argument("--out", default=str(ROOT / "public" / "voice"))
    ap.add_argument("--manifest", default=str(ROOT / "src" / "data" / "voice-manifest.json"))
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--only", nargs="*", help="nur diese Texte neu erzeugen")
    ap.add_argument("--length-scale", type=float, default=1.12)
    args = ap.parse_args()

    from piper import PiperVoice, SynthesisConfig

    voice = PiperVoice.load(args.model)
    cfg = SynthesisConfig(length_scale=args.length_scale, noise_scale=0.6, noise_w_scale=0.75)

    lines = json.loads(Path(args.lines).read_text())
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    wanted = {item["key"] for item in lines}

    made = 0
    for i, item in enumerate(lines):
        path = out / f"{item['key']}.mp3"
        redo = args.force or (args.only and item["text"] in args.only)
        if path.exists() and not redo:
            continue
        audio, rate = synth(voice, cfg, spoken(item["text"]))
        encode_mp3(trim(audio, rate), rate, path)
        made += 1
        if made % 25 == 0:
            print(f"  {made} erzeugt … ({i + 1}/{len(lines)})", flush=True)

    removed = 0
    for f in out.glob("*.mp3"):
        if f.stem not in wanted:
            f.unlink()
            removed += 1

    keys = sorted(f.stem for f in out.glob("*.mp3"))
    Path(args.manifest).write_text(json.dumps(keys) + "\n")
    size = sum(f.stat().st_size for f in out.glob("*.mp3"))
    print(f"Fertig: {made} neu, {removed} entfernt, {len(keys)} Dateien, {size / 1024 / 1024:.2f} MB")


if __name__ == "__main__":
    sys.exit(main())
