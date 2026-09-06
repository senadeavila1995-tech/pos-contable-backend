#!/bin/bash

echo "======================================"
echo "       🚀 POS CONTABLE"
echo "======================================"

BACKEND="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND="${FRONTEND_DIR:-$(dirname "$BACKEND")/pos-contable-frontend}"

BACKEND_LOG="/tmp/pos-backend.log"
FRONTEND_LOG="/tmp/pos-frontend.log"

echo ""
echo "🗄️  Comprobando MySQL..."

if systemctl is-active --quiet mysql; then
    echo "✅ MySQL ya está ejecutándose"
else
    echo "▶️  Iniciando MySQL..."
    sudo systemctl start mysql

    if systemctl is-active --quiet mysql; then
        echo "✅ MySQL iniciado"
    else
        echo "❌ No se pudo iniciar MySQL"
        exit 1
    fi
fi

echo ""
echo "🔙 Preparando Backend..."

cd "$BACKEND" || exit 1

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del Backend..."
    npm install
fi

npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error compilando Backend"
    exit 1
fi

echo "✅ Backend compilado"

echo ""
echo "🔎 Comprobando procesos anteriores..."

pkill -f "node.*3000" 2>/dev/null
pkill -f "vite.*5173" 2>/dev/null

sleep 2

echo ""
echo "🔙 Iniciando Backend en puerto 3000..."

cd "$BACKEND"

nohup npm start > "$BACKEND_LOG" 2>&1 &

BACKEND_PID=$!

echo "✅ Backend iniciado"
echo "   PID: $BACKEND_PID"

sleep 3

echo ""
echo "🎨 Iniciando Frontend en puerto 5173..."

cd "$FRONTEND"

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del Frontend..."
    npm install
fi

nohup npm run dev -- --host 0.0.0.0 > "$FRONTEND_LOG" 2>&1 &

FRONTEND_PID=$!

echo "✅ Frontend iniciado"
echo "   PID: $FRONTEND_PID"

sleep 4

echo ""
echo "======================================"
echo "       ✅ POS CONTABLE LISTO"
echo "======================================"
echo ""
echo "🗄️  MySQL     → ejecutándose"
echo "🔙 Backend    → http://localhost:3000"
echo "🎨 Frontend   → http://localhost:5173"
echo ""
echo "📋 Logs:"
echo "   Backend  → $BACKEND_LOG"
echo "   Frontend → $FRONTEND_LOG"
echo ""
echo "======================================"

if curl -s --max-time 3 http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Backend responde correctamente"
else
    echo "⚠️  Backend todavía está iniciando..."
fi

if curl -s --max-time 3 http://localhost:5173 >/dev/null 2>&1; then
    echo "✅ Frontend responde correctamente"
else
    echo "⚠️  Frontend todavía está iniciando..."
fi

echo ""
echo "🌐 Abriendo POS Contable..."

xdg-open "http://localhost:5173" >/dev/null 2>&1 &

echo ""
echo "🚀 Sistema iniciado correctamente."
echo ""
