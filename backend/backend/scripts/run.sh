#!/bin/bash
# Wrapper script to run Python scripts with correct environment

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT" || exit 1

# Activate venv if exists
if [ -d ".venv/bin" ]; then
    source .venv/bin/activate
elif [ -d ".venv/Scripts" ]; then
    source .venv/Scripts/activate
fi

# Run the script
python "$@"
