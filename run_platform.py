import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def run():
    print('=' * 60)
    print('  STARTING NAVOPTIMA MARITIME PLATFORM FULL-STACK')
    print('=' * 60)
    
    print('[1/2] Launching FastAPI Backend on http://localhost:8000...')
    backend_proc = subprocess.Popen(
        [sys.executable, '-m', 'uvicorn', 'backend.main:app', '--host', '0.0.0.0', '--port', '8000'],
        cwd=str(ROOT)
    )
    
    time.sleep(1.5)
    
    print('[2/2] Launching Vite Frontend on http://localhost:5173...')
    frontend_dir = ROOT / 'frontend'
    frontend_proc = subprocess.Popen(
        ['npm', 'run', 'dev'],
        cwd=str(frontend_dir),
        shell=True
    )
    
    print('\nNavOptima Full-Stack is running!')
    print('-> Open Dashboard: http://localhost:5173')
    print('-> API Docs:       http://localhost:8000/docs\n')
    print('Press Ctrl+C to stop both servers.')
    
    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print('\nShutting down NavOptima services...')
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == '__main__':
    run()
