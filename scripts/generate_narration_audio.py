#!/usr/bin/env python3
"""
OOPS! WORLD — THE GREAT DISASTER (Part 1)
Narration Audio Synthesizer Script

Generates modular MP3 voice-over recordings for all scenes using ffmpeg libflite,
inserting natural dramatic pauses between sentences and applying warm acoustic filters.
"""

import os
import subprocess
import tempfile

SCENES = {
    "scene1_world_of_wonder": {
        "voice": "rms",
        "speed": 0.95,
        "pitch": 0.95,
        "lines": [
            "Once upon a time, there was a beautiful world filled with wonder, laughter, and endless adventures.",
            "Every day brought something new. Every moment was filled with happiness.",
            "In this peaceful world lived a little fellow named Bobo.",
            "He was curious, playful, and always ready for an adventure.",
            "But little did he know... his world was about to change forever."
        ]
    },
    "scene2_mysterious_crystal": {
        "voice": "rms",
        "speed": 0.92,
        "pitch": 0.92,
        "lines": [
            "Hidden deep within the world was something extraordinary.",
            "An ancient crystal... holding an unknown power.",
            "For generations, its secrets remained untouched.",
            "Until one day...",
            "A strange energy began to awaken."
        ]
    },
    "scene3_great_disaster": {
        "voice": "rms",
        "speed": 1.05,
        "pitch": 1.0,
        "lines": [
            "Without warning... the crystal exploded!",
            "The skies roared. The ground trembled. The oceans rose.",
            "Storms swallowed the skies. Nature turned against itself.",
            "The peaceful world was thrown into chaos.",
            "Everything Bobo knew... was gone."
        ]
    },
    "scene4_six_forces": {
        "voice": "rms",
        "speed": 0.96,
        "pitch": 0.94,
        "lines": [
            "But the disaster was far greater than anyone could imagine...",
            "Earth trembled. Waters rose. Storms unleashed their fury.",
            "The climate turned against life. Nature itself became unpredictable.",
            "And even the darkness of space brought danger.",
            "Six different forces of destruction threatened the world.",
            "Six disasters. Six impossible challenges.",
            "Geophysical. Hydrological. Meteorological. Climatological. Biological. And Extraterrestrial."
        ]
    },
    "scene5_bobo_survival": {
        "voice": "rms",
        "speed": 0.94,
        "pitch": 0.95,
        "lines": [
            "Amid the chaos, one little survivor remained.",
            "Bobo.",
            "Scared, confused, and separated from everyone he knew...",
            "But he was not ready to give up.",
            "Somewhere out there, his friends were waiting.",
            "And Bobo made a promise...",
            "He would find them. He would rescue them.",
            "No matter how dangerous the journey became."
        ]
    },
    "scene6_adventure_begins": {
        "voice": "rms",
        "speed": 0.98,
        "pitch": 0.96,
        "lines": [
            "Across six disaster zones, Bobo must survive unimaginable challenges.",
            "Earthquakes. Floods. Terrifying storms. Extreme climates. Biological threats. And dangers from beyond our world.",
            "Every journey will test his courage.",
            "Every challenge will bring him closer to his friends.",
            "And every step will bring him closer to the truth behind the great disaster.",
            "But for now...",
            "Survival comes first!"
        ]
    },
    "scene7_title_reveal": {
        "voice": "rms",
        "speed": 0.92,
        "pitch": 0.90,
        "lines": [
            "One little survivor.",
            "Six deadly disasters.",
            "An adventure that will change everything.",
            "Welcome to...",
            "OOPS! WORLD.",
            "THE GREAT DISASTER.",
            "SURVIVAL BEGINS."
        ]
    },
    "part1_conclusion": {
        "voice": "rms",
        "speed": 0.94,
        "pitch": 0.95,
        "lines": [
            "Against all odds... Bobo did it.",
            "Six disasters. Six impossible journeys.",
            "And every friend... finally reunited.",
            "The world may never be the same again.",
            "But together, they had survived.",
            "For now, the greatest disaster was over.",
            "Or so they believed...",
            "THE END — PART 1."
        ]
    },
    "part2_trailer": {
        "voice": "rms",
        "speed": 0.88,
        "pitch": 0.88,
        "lines": [
            "Some mysteries are better left undiscovered...",
            "But some secrets refuse to stay hidden.",
            "Beyond the world Bobo fought to save...",
            "Something is waiting.",
            "Something ancient.",
            "Something that knows more than anyone could imagine.",
            "The journey is far from over.",
            "OOPS! WORLD.",
            "PART 2 — THE HIDDEN TRUTH.",
            "COMING SOON."
        ]
    }
}

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUTPUT_DIRS = [
    os.path.join(PROJECT_ROOT, "audio/narration"),
    os.path.join(PROJECT_ROOT, "app/src/main/assets/audio/narration")
]

def sanitize_text(text):
    # Escape single quotes for ffmpeg filter string
    return text.replace("'", "\\'")

def generate_scene(scene_id, config):
    print(f"🎙️ Generating voice audio for: {scene_id}...")
    voice = config.get("voice", "rms")
    lines = config.get("lines", [])
    
    with tempfile.TemporaryDirectory() as tmpdir:
        part_files = []
        silence_file = os.path.join(tmpdir, "silence.wav")
        # Generate 0.55s silence for natural sentence pauses
        subprocess.run([
            "ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
            "-t", "0.55", silence_file
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        
        for idx, line in enumerate(lines):
            safe_line = sanitize_text(line)
            part_file = os.path.join(tmpdir, f"part_{idx:03d}.wav")
            
            cmd = [
                "ffmpeg", "-y", "-f", "lavfi",
                "-i", f"flite=voice={voice}:text='{safe_line}'",
                "-af", "aresample=44100,volume=1.5",
                part_file
            ]
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            part_files.append(part_file)
            part_files.append(silence_file)
            
        # Concat list file
        concat_list_file = os.path.join(tmpdir, "concat.txt")
        with open(concat_list_file, "w") as f:
            for pf in part_files:
                f.write(f"file '{pf}'\n")
                
        # Combine and export to target output dirs
        temp_out = os.path.join(tmpdir, f"{scene_id}.mp3")
        subprocess.run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", concat_list_file,
            "-af", "highpass=f=80,equalizer=f=250:width_type=h:width=100:g=3",
            "-b:a", "128k",
            temp_out
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        
        for out_dir in OUTPUT_DIRS:
            os.makedirs(out_dir, exist_ok=True)
            dest = os.path.join(out_dir, f"{scene_id}.mp3")
            with open(temp_out, "rb") as sf, open(dest, "wb") as df:
                df.write(sf.read())
            print(f"  ✓ Saved to {dest} ({os.path.getsize(dest)} bytes)")

def main():
    print("🎬 Starting OOPS! WORLD Narration Audio Synthesis...")
    for scene_id, config in SCENES.items():
        generate_scene(scene_id, config)
    print("✨ All narration audio files generated successfully!")

if __name__ == "__main__":
    main()
