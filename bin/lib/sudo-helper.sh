#!/bin/bash
# Sudo Helper - Automatic sudo password handling

SECRETS_DIR="/home/pilote/.secrets"
SUDO_PASSWORD_FILE="$SECRETS_DIR/sudo-password"

# Get sudo password from secure file
get_sudo_password() {
  if [ -f "$SUDO_PASSWORD_FILE" ]; then
    cat "$SUDO_PASSWORD_FILE"
  else
    echo ""
  fi
}

# Execute command with sudo using stored password
sudo_exec() {
  local password=$(get_sudo_password)

  if [ -z "$password" ]; then
    echo "ERROR: Sudo password not configured in $SUDO_PASSWORD_FILE" >&2
    echo "Please set it up first with: echo 'YOUR_PASSWORD' > $SUDO_PASSWORD_FILE" >&2
    return 1
  fi

  # Execute and filter only the password prompt line from stderr
  echo "$password" | sudo -S "$@" 2> >(grep -v "\[sudo\] password" >&2)
}

# Check if sudo password is configured
is_sudo_configured() {
  [ -f "$SUDO_PASSWORD_FILE" ] && [ -s "$SUDO_PASSWORD_FILE" ]
}

# Export functions for use in other scripts
export -f get_sudo_password
export -f sudo_exec
export -f is_sudo_configured
