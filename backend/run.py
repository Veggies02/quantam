import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import uvicorn

def main():
    print('=' * 60)
    print('  NAVOPTIMA MARITIME AUTONOMOUS PLATFORM BACKEND')
    print('  Version: 2.4.0-enterprise')
    print('=' * 60)
    print('  -> API Documentation: http://localhost:8000/docs')
    print('  -> Health Status:     http://localhost:8000/api/health')
    print('  -> Platform Matrix:   http://localhost:8000/api/status')
    print('=' * 60)
    uvicorn.run('backend.main:app', host='0.0.0.0', port=8000, reload=True)

if __name__ == '__main__':
    main()
