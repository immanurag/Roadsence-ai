#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

python scripts/ingest_data.py
python scripts/train_severity_model.py
python scripts/detect_hotspots.py
