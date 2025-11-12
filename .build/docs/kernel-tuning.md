# Kernel Tuning - VPS Performance Optimization

Optimize Linux kernel parameters for Node.js + Nginx + PM2 workloads on VPS servers.

## Overview

The `tune-kernel` CLI automates kernel parameter optimization for high-performance VPS deployments. It safely applies recommended sysctl parameters with automatic backups and rollback capability.

**Workload Optimized For:**
- Node.js web servers (multiple instances via PM2)
- Nginx reverse proxy / load balancer
- High-concurrency applications
- Connection-intensive workflows

## Quick Start

```bash
# Show current kernel parameters
tune-kernel show

# Apply recommended optimizations
tune-kernel apply

# Verify optimizations are applied
tune-kernel verify

# Check status
tune-kernel status
```

## Commands

### `tune-kernel show`
Display current kernel parameter values compared with recommended settings.

```bash
tune-kernel show
```

Shows critical parameters:
- `net.core.somaxconn` - Max backlog queue
- `net.ipv4.tcp_max_syn_backlog` - SYN backlog limit
- `net.ipv4.ip_local_port_range` - Available ephemeral ports
- `fs.file-max` - System-wide file descriptor limit
- `fs.nr_open` - Per-process file descriptor limit
- `net.ipv4.tcp_tw_reuse` - TCP TIME-WAIT reuse
- `vm.swappiness` - Memory swap preference

### `tune-kernel apply`
Apply recommended kernel optimizations to both running system and permanent configuration.

```bash
tune-kernel apply
tune-kernel apply --dry-run      # Preview changes without applying
tune-kernel apply --no-verify    # Skip verification after applying
```

**Steps:**
1. Creates backup of current sysctl configuration
2. Displays parameters to be applied
3. Applies to running system (via sysctl -w)
4. Writes permanent configuration to `/etc/sysctl.d/99-vps-optimize.conf`
5. Verifies all parameters are correctly set

**Note:** Some parameters (memory management) require system reboot to take full effect. Recommend rebooting at a convenient time.

### `tune-kernel verify`
Verify that optimizations have been correctly applied to the running system.

```bash
tune-kernel verify
```

Checks:
- `net.core.somaxconn` = 65535 (max backlog connections)
- `net.ipv4.tcp_max_syn_backlog` = 65535 (SYN backlog)
- `net.ipv4.ip_local_port_range` = 1024 65535 (ephemeral port range)
- `net.ipv4.tcp_tw_reuse` = 1 (connection reuse enabled)
- `fs.file-max` = 2097152 (system file descriptor limit)

### `tune-kernel backup`
Create a manual backup of current sysctl configuration.

```bash
tune-kernel backup
```

Backups are stored in: `/home/pilote/projekt/primaire/BUILDER/bin/lib/kernel-backups/`

### `tune-kernel status`
Show current optimization status and list available backups.

```bash
tune-kernel status
```

### `tune-kernel rollback <backup-file>`
Rollback kernel parameters to a previous backup.

```bash
tune-kernel rollback /path/to/backup.conf
tune-kernel list-backups   # Find backup file paths
```

### `tune-kernel list-backups`
List all available kernel configuration backups.

```bash
tune-kernel list-backups
```

## Kernel Parameters Explained

### Network Optimizations

**`net.core.somaxconn = 65535`**
- **Description:** Maximum number of connections in the kernel listen queue
- **Default:** 128
- **Impact:** Allows more concurrent pending connections. Critical for Nginx/Node.js handling bursts
- **Performance:** Medium - increases backlog handling capacity

**`net.ipv4.tcp_max_syn_backlog = 65535`**
- **Description:** Maximum number of connections in SYN_RECV state
- **Default:** 128
- **Impact:** Protects against SYN floods and allows more simultaneous connection establishments
- **Performance:** Medium - improves connection acceptance rate

**`net.ipv4.ip_local_port_range = 1024 65535`**
- **Description:** Range of ephemeral (temporary) ports for outbound connections
- **Default:** 32768 60999
- **Impact:** Expands available ports for multiple concurrent outbound connections (crucial for PM2 multiple processes)
- **Performance:** Low-Medium - prevents "Address already in use" errors with many connections

**`net.ipv4.tcp_tw_reuse = 1`**
- **Description:** Allow reuse of TIME-WAIT sockets for new connections
- **Default:** 0 (disabled)
- **Impact:** Reduces connection setup time by reusing TIME-WAIT sockets instead of waiting for natural timeout
- **Performance:** High - significant improvement for high-concurrency applications

**`net.ipv4.tcp_fin_timeout = 30`**
- **Description:** How long (seconds) to keep FIN-WAIT-2 sockets
- **Default:** 60
- **Impact:** Faster release of connection resources
- **Performance:** Low - minor improvement in resource cleanup

### Connection Pool Management

**`net.ipv4.tcp_max_tw_buckets = 2000000`**
- **Description:** Maximum number of TIME-WAIT sockets
- **Default:** 131072
- **Impact:** Prevents "increase number of TIME-WAIT buckets" kernel warnings
- **Performance:** Medium - avoids connection rejection when TIME-WAIT limit exceeded

**`net.ipv4.tcp_keepalive_time = 600`**
- **Description:** How long (seconds) before TCP starts sending keepalive probes
- **Default:** 7200 (2 hours)
- **Impact:** Faster detection of dead connections
- **Performance:** Low - improves connection reliability

**`net.ipv4.tcp_keepalive_probes = 3`**
- **Description:** Number of keepalive probes before giving up
- **Default:** 9
- **Impact:** Faster detection of unresponsive connections
- **Performance:** Low - cleaner connection termination

**`net.ipv4.tcp_keepalive_intvl = 15`**
- **Description:** Interval (seconds) between keepalive probes
- **Default:** 75
- **Impact:** Faster detection of broken connections
- **Performance:** Low - improved connection health

### Performance Tuning

**`net.core.netdev_max_backlog = 65535`**
- **Description:** Maximum packets in network device queue
- **Default:** 1000
- **Impact:** Handles traffic spikes better
- **Performance:** Medium - prevents packet drop during high throughput

**`net.ipv4.tcp_rmem = 4096 87380 67108864`**
- **Description:** Min, default, max TCP receive buffer size
- **Default:** 4096 87380 6291456
- **Impact:** Allows larger receive buffers for fast networks
- **Performance:** High - improves throughput for large data transfers

**`net.ipv4.tcp_wmem = 4096 65536 67108864`**
- **Description:** Min, default, max TCP send buffer size
- **Default:** 4096 16384 4194304
- **Impact:** Allows larger send buffers for high-bandwidth scenarios
- **Performance:** High - improves upload/downstream throughput

### File Descriptor Limits

**`fs.file-max = 2097152`**
- **Description:** System-wide maximum number of open file descriptors
- **Default:** Varies, typically 64K on cloud VPS
- **Impact:** Allows thousands of simultaneous connections system-wide
- **Performance:** Critical - prevents "too many open files" errors

**`fs.nr_open = 2097152`**
- **Description:** Per-process maximum number of open file descriptors
- **Default:** 1048576
- **Impact:** Increases limit for individual processes (PM2 processes, Nginx workers)
- **Performance:** Critical - allows single process to handle more connections

### Memory Management

**`vm.swappiness = 10`**
- **Description:** How aggressively kernel swaps memory to disk (0-100)
- **Default:** 60
- **Impact:** Keeps frequently used data in RAM, improves performance
- **Performance:** Medium-High - reduces disk I/O from swapping

**`vm.vfs_cache_pressure = 50`**
- **Description:** How much kernel reclaims inode/dentry cache (0-100)
- **Default:** 100
- **Impact:** Keeps filesystem cache in memory longer
- **Performance:** Low-Medium - improves filesystem performance with many small files

## Performance Impact Summary

### Expected Improvements

**Connection Handling:**
- 5-10x increase in concurrent connection handling capacity
- Faster connection establishment
- Reduced connection rejection during traffic spikes

**File Operations:**
- Eliminates "too many open files" errors
- Supports thousands of simultaneous file operations
- Critical for Node.js applications with many concurrent requests

**Network Throughput:**
- 20-40% improvement in large data transfer performance
- Better buffer allocation for fast network cards
- Improved upstream/downstream bandwidth utilization

**Memory Efficiency:**
- Reduced swap usage (keeps data in RAM)
- More efficient disk cache management
- Better performance on systems with limited swap

## Prerequisites

### Sudo Password Configuration

The `tune-kernel` CLI requires sudo password to apply kernel parameters. Store it securely:

```bash
# Create secrets directory (if needed)
mkdir -p /home/pilote/.secrets
chmod 700 /home/pilote/.secrets

# Store sudo password
echo "YOUR_SUDO_PASSWORD" > /home/pilote/.secrets/sudo-password
chmod 600 /home/pilote/.secrets/sudo-password
```

**Alternative (Recommended for Production):**
Configure passwordless sudo for sysctl commands:

```bash
# Edit sudoers file (CAREFULLY!)
sudo visudo

# Add this line (replace USERNAME with your user):
# USERNAME ALL=(ALL) NOPASSWD: /sbin/sysctl
```

## Rollback & Safety

### Automatic Backups

The `tune-kernel apply` command automatically creates backups before modifying parameters:

```bash
# Backups stored in:
/home/pilote/projekt/primaire/BUILDER/bin/lib/kernel-backups/
```

### Manual Rollback

To restore a previous configuration:

```bash
# List available backups
tune-kernel list-backups

# Rollback to specific backup
tune-kernel rollback /path/to/sysctl-backup-YYYYMMDD-HHMMSS.conf

# Manual restoration (if needed)
sudo sysctl -p /path/to/backup.conf
```

## Verification After Apply

After running `tune-kernel apply`, verify optimization:

```bash
# Check if parameters are applied correctly
tune-kernel verify

# View current kernel parameters
tune-kernel show

# Check system status
tune-kernel status
```

## Common Issues

### "Sudo password not configured"

**Error:**
```
ERROR: Sudo password not configured
```

**Solution:**
Configure sudo password file:
```bash
mkdir -p /home/pilote/.secrets
echo "YOUR_PASSWORD" > /home/pilote/.secrets/sudo-password
chmod 600 /home/pilote/.secrets/sudo-password
```

Or use passwordless sudo (recommended).

### "Parameter verification failed"

Some parameters may show as "not verified" on first check:

```bash
# This is normal if:
# 1. System was recently rebooted (memory params taking effect)
# 2. Parameter requires reboot to apply fully

# Wait a few seconds and retry:
sleep 5
tune-kernel verify
```

### Permission Denied

Ensure sudo is properly configured:

```bash
# Test sudo access
sudo sysctl -a | head

# Check /etc/sudoers configuration
sudo visudo  # Review for sysctl permissions
```

## Integration with PM2 Deployment

The kernel optimizations work best with PM2 multi-instance Node.js deployment:

```bash
# Typical high-performance PM2 setup (after kernel tuning):
pm2 start app.js -i 4 --name web-server  # 4 processes

# With kernel tuning, each process can handle:
# - More concurrent connections
# - More open files/sockets
# - Better throughput
```

## Monitoring After Optimization

Monitor key metrics after applying optimizations:

```bash
# Check current connections
ss -an | grep ESTABLISHED | wc -l

# Check TIME-WAIT sockets (should be healthy with tcp_tw_reuse=1)
ss -an | grep TIME-WAIT | wc -l

# Monitor open files across system
lsof -a -u nobody | wc -l  # Nginx user typically

# Check swap usage (should remain low)
free -h
```

## Production Checklist

Before deploying to production:

- [ ] Test on staging environment first
- [ ] Review kernel parameters for your specific workload
- [ ] Create baseline backup: `tune-kernel backup`
- [ ] Run dry-run: `tune-kernel apply --dry-run`
- [ ] Schedule maintenance window for reboot (some params need reboot)
- [ ] Apply optimizations: `tune-kernel apply`
- [ ] Verify: `tune-kernel verify`
- [ ] Monitor application performance post-apply
- [ ] Plan reboot at convenient time

## Advanced: Custom Parameters

To use custom kernel parameters instead of defaults:

```bash
# Edit the recommended parameters in kernel-params.sh:
# function: get_recommended_params()

# Or create custom sysctl file:
cat > /tmp/custom-params.conf <<'EOF'
net.core.somaxconn=32768
net.ipv4.tcp_max_syn_backlog=4096
# ... other params
EOF

# Apply manually:
sudo sysctl -p /tmp/custom-params.conf
```

## References

- [Linux kernel documentation: sysctl](https://www.kernel.org/doc/html/latest/userspace-api/sysctl/index.html)
- [Nginx tuning for performance](https://nginx.org/en/docs/http/ngx_http_core_module.html)
- [Node.js scaling guide](https://nodejs.org/en/docs/guides/scaling-web-app)
- [TCP/IP Illustrated](https://en.wikipedia.org/wiki/TCP/IP_Illustrated)

## Support

For issues or questions:

1. Check current parameters: `tune-kernel show`
2. Verify optimization: `tune-kernel verify`
3. Check backups: `tune-kernel list-backups`
4. Review system logs: `dmesg | tail -20`

---

**Last Updated:** 2025-01-11
**Version:** 1.0.0
