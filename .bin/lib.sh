#!/usr/bin/env bash
# lib.sh — sourced helper library. Defines helpers + resolves PROJECT_ROOT.
# IMPORTANT: do NOT add `set -euo pipefail` here — it would impose strict mode on
# every script that sources this file. Only the executable entrypoints set it.

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PROJECT_ROOT

# Disable color when stdout is not a TTY or when running in CI (clean CI logs).
if [ -t 1 ] && [ -z "${CI:-}" ]; then
  C_RED=$'\033[31m'; C_DIM=$'\033[2m'; C_RESET=$'\033[0m'
else
  C_RED=''; C_DIM=''; C_RESET=''
fi

log() { printf '%s%s%s\n' "$C_DIM" "$*" "$C_RESET"; }
die() { printf '%s%s%s\n' "$C_RED" "$*" "$C_RESET" >&2; exit 1; }
