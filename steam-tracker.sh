#!/bin/bash

trap "echo 'Stopping...'; kill $BACK_PID $FRONT_PID 2>/dev/null; exit" INT

wait_for_port() {
  local port=$1
  echo "Waiting for port $port..."
  while ! (echo > /dev/tcp/localhost/$port) >/dev/null 2>&1; do
    sleep 1
  done
  echo "Port $port is ready."
}

cd /myspace/Projects/Steam-Tracker/backend
npm run dev &
BACK_PID=$!

cd /myspace/Projects/Steam-Tracker/frontend
npm run dev &
FRONT_PID=$!

wait_for_port 3001   # backend
wait_for_port 5173   # frontend

echo "Launching Steam Tracker..."
/home/vishrut/Applications/steam-tracker.AppImage

echo "Shutting down servers..."
kill $BACK_PID 2>/dev/null
kill $FRONT_PID 2>/dev/null

echo "Done."
