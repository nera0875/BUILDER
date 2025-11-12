#!/bin/bash

# Port Utilities - JSON-based port registry management
# Uses Node.js for JSON manipulation (no jq dependency)

set -e

# Get registry file path
get_registry_path() {
  echo "/home/pilote/projet/primaire/BUILDER/bin/lib/port-registry.json"
}

# Initialize registry file if not exists
init_registry() {
  local registry_path=$(get_registry_path)

  if [ ! -f "$registry_path" ]; then
    echo '{"builder-dashboard":9000}' > "$registry_path"
  fi
}

# Read entire registry
read_registry() {
  local registry_path=$(get_registry_path)
  init_registry
  cat "$registry_path"
}

# Get port for specific project
get_project_port() {
  local project_name="$1"
  local registry_path=$(get_registry_path)
  init_registry

  node -e "
    const fs = require('fs');
    try {
      const registry = JSON.parse(fs.readFileSync('$registry_path', 'utf8'));
      console.log(registry['$project_name'] || '');
    } catch(e) {
      console.log('');
    }
  "
}

# Get all used ports as array
get_all_used_ports() {
  local registry_path=$(get_registry_path)
  init_registry

  node -e "
    const fs = require('fs');
    try {
      const registry = JSON.parse(fs.readFileSync('$registry_path', 'utf8'));
      const ports = Object.values(registry).filter(p => !isNaN(p));
      console.log(ports.join(' '));
    } catch(e) {
      console.log('');
    }
  "
}

# Find next free port (max port + 1, or 3001 if empty)
find_next_free_port() {
  local registry_path=$(get_registry_path)
  init_registry

  node -e "
    const fs = require('fs');
    try {
      const registry = JSON.parse(fs.readFileSync('$registry_path', 'utf8'));
      const ports = Object.values(registry)
        .filter(p => !isNaN(p))
        .map(Number);

      if (ports.length === 0) {
        console.log(3001);
      } else {
        console.log(Math.max(...ports) + 1);
      }
    } catch(e) {
      console.log(3001);
    }
  "
}

# Assign port to project
assign_port() {
  local project_name="$1"
  local port="$2"
  local registry_path=$(get_registry_path)
  init_registry

  # Atomic write using temp file
  local tmp_file="${registry_path}.tmp"

  node -e "
    const fs = require('fs');
    try {
      const registry = JSON.parse(fs.readFileSync('$registry_path', 'utf8'));
      registry['$project_name'] = parseInt('$port', 10);
      fs.writeFileSync('$tmp_file', JSON.stringify(registry, null, 2));
      console.log('OK');
    } catch(e) {
      console.error('ERROR: ' + e.message);
      process.exit(1);
    }
  "

  if [ $? -eq 0 ]; then
    mv "$tmp_file" "$registry_path"

    # Auto-regenerate Nginx config
    local nginx_script="/home/pilote/projet/primaire/BUILDER/bin/generate-nginx-config"
    if [ -x "$nginx_script" ]; then
      "$nginx_script" > /dev/null 2>&1 || true
    fi
  fi
}

# Release port from project
release_port() {
  local project_name="$1"
  local registry_path=$(get_registry_path)
  init_registry

  # Atomic write using temp file
  local tmp_file="${registry_path}.tmp"

  node -e "
    const fs = require('fs');
    try {
      const registry = JSON.parse(fs.readFileSync('$registry_path', 'utf8'));
      delete registry['$project_name'];
      fs.writeFileSync('$tmp_file', JSON.stringify(registry, null, 2));
      console.log('OK');
    } catch(e) {
      console.error('ERROR: ' + e.message);
      process.exit(1);
    }
  "

  if [ $? -eq 0 ]; then
    mv "$tmp_file" "$registry_path"

    # Auto-regenerate Nginx config
    local nginx_script="/home/pilote/projet/primaire/BUILDER/bin/generate-nginx-config"
    if [ -x "$nginx_script" ]; then
      "$nginx_script" > /dev/null 2>&1 || true
    fi
  fi
}

# Cleanup deleted projects from registry
cleanup_deleted_projects() {
  local registry_path=$(get_registry_path)
  local secondaire_dir="/home/pilote/projet/secondaire"
  init_registry

  # Get list of projects in registry
  local registry_projects=$(node -e "
    const fs = require('fs');
    try {
      const registry = JSON.parse(fs.readFileSync('$registry_path', 'utf8'));
      console.log(Object.keys(registry).join(' '));
    } catch(e) {
      console.log('');
    }
  ")

  # Check each project exists on disk
  for project in $registry_projects; do
    # Skip builder-dashboard (special case)
    if [ "$project" == "builder-dashboard" ]; then
      continue
    fi

    # Check if project directory exists
    if [ ! -d "$secondaire_dir/$project" ]; then
      echo "🗑️  Removing deleted project: $project"
      release_port "$project"
    fi
  done
}

# Export functions (if sourced)
if [ "${BASH_SOURCE[0]}" != "${0}" ]; then
  export -f get_registry_path
  export -f init_registry
  export -f read_registry
  export -f get_project_port
  export -f get_all_used_ports
  export -f find_next_free_port
  export -f assign_port
  export -f release_port
  export -f cleanup_deleted_projects
fi
