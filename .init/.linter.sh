#!/bin/bash
cd /home/kavia/workspace/code-generation/ping-monitor-212249-212258/ping_gui_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

