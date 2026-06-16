#!/bin/sh
set -e
npm install --prefix frontend
npm run build --prefix frontend
