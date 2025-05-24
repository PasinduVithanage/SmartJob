@echo off
setlocal

echo Installing frontend dependencies...
cd frontend
call npm install

echo Starting frontend...
start cmd /k "npm run dev"
timeout /t 5

cd ..

echo Installing backend dependencies...
cd backend
call pip install -r requirements.txt

echo Starting backend...
start cmd /k "python app.py"

echo Opening frontend in browser...
start http://localhost:5173

endlocal
