#!/bin/bash

# Debug deployment script
echo "=== ECOMMERCE DEPLOYMENT DEBUG ==="
echo "Date: $(date)"
echo ""

# Test SSH connection
echo "1. Testing SSH connection..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 -o PreferredAuthentications=password -o PubkeyAuthentication=no $SERVER_USER@$SERVER_HOST "
    echo 'SSH connection successful'
    echo ''
    
    # Check if deployment directory exists
    echo '2. Checking deployment directory...'
    if [ -d '/www/wwwroot' ]; then
        echo '✓ /www/wwwroot exists'
        ls -la /www/wwwroot/
    else
        echo '✗ /www/wwwroot does not exist'
    fi
    echo ''
    
    # Check if index.html exists and is readable
    echo '3. Checking index.html...'
    if [ -f '/www/wwwroot/index.html' ]; then
        echo '✓ index.html exists'
        echo 'File size:'
        ls -lh /www/wwwroot/index.html
        echo 'First 5 lines:'
        head -5 /www/wwwroot/index.html
    else
        echo '✗ index.html does not exist'
    fi
    echo ''
    
    # Check assets directory
    echo '4. Checking assets directory...'
    if [ -d '/www/wwwroot/assets' ]; then
        echo '✓ assets directory exists'
        ls -la /www/wwwroot/assets/ | head -10
    else
        echo '✗ assets directory does not exist'
    fi
    echo ''
    
    # Check web server status
    echo '5. Checking web server status...'
    systemctl status nginx 2>/dev/null | head -5 || echo 'Nginx status check failed'
    systemctl status apache2 2>/dev/null | head -5 || echo 'Apache status check failed'
    echo ''
    
    # Check if port 80 is listening
    echo '6. Checking if port 80 is listening...'
    netstat -tlnp | grep :80 || echo 'Port 80 not listening'
    echo ''
    
    # Test local web server
    echo '7. Testing local web server...'
    curl -I http://localhost/ 2>/dev/null || echo 'Local web server test failed'
    echo ''
    
    # Check nginx configuration
    echo '8. Checking nginx configuration...'
    if [ -f '/www/server/nginx/conf/130.94.40.85.conf' ]; then
        echo '✓ Nginx config exists'
        cat /www/server/nginx/conf/130.94.40.85.conf
    else
        echo '✗ Nginx config does not exist'
    fi
    echo ''
    
    # Check apache configuration
    echo '9. Checking apache configuration...'
    if [ -f '/www/server/apache/conf/extra/130.94.40.85.conf' ]; then
        echo '✓ Apache config exists'
        cat /www/server/apache/conf/extra/130.94.40.85.conf
    else
        echo '✗ Apache config does not exist'
    fi
    echo ''
    
    # Check aaPanel website configuration
    echo '10. Checking aaPanel website configuration...'
    ls -la /www/server/panel/vhost/nginx/ 2>/dev/null || echo 'aaPanel nginx vhost directory not found'
    ls -la /www/server/panel/vhost/apache/ 2>/dev/null || echo 'aaPanel apache vhost directory not found'
    echo ''
    
    # Check if there are any conflicting configurations
    echo '11. Checking for conflicting configurations...'
    find /www/server/nginx/conf/ -name '*.conf' -exec grep -l '130.94.40.85' {} \; 2>/dev/null || echo 'No nginx configs found for this IP'
    find /www/server/apache/conf/ -name '*.conf' -exec grep -l '130.94.40.85' {} \; 2>/dev/null || echo 'No apache configs found for this IP'
    echo ''
    
    # Check web server error logs
    echo '12. Checking recent web server errors...'
    tail -10 /var/log/nginx/error.log 2>/dev/null || echo 'Nginx error log not accessible'
    tail -10 /var/log/apache2/error.log 2>/dev/null || echo 'Apache error log not accessible'
    echo ''
    
    echo '=== DEBUG COMPLETE ==='
"
