#!/bin/bash
# setup.sh — one command to get the backend ready to run.
# Usage: bash setup.sh

set -e

echo "Setting up TrailScope backend..."
cd backend

if [ ! -d "venv" ]; then
  python3 -m venv venv
fi
source venv/bin/activate

pip install -q --upgrade pip
pip install -q -r requirements.txt

echo ""
echo "Backend deps installed."
echo ""
echo "NEXT STEPS:"
echo "1. Download PaySim dataset from Kaggle, save as data/raw/paysim.csv"
echo "2. cd backend && source venv/bin/activate"
echo "3. python data_prep.py"
echo "4. python feature_engineering.py"
echo "5. python train_model.py"
echo "6. python graph_builder.py"
echo "7. uvicorn main:app --reload --port 8000"
echo ""
echo "Then in a separate terminal: cd frontend && npm install && npm run dev"
