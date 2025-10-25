#!/bin/bash

# Fix deployment script
echo "=== FIXING ECOMMERCE DEPLOYMENT ==="
echo "Date: $(date)"
echo ""

# Apply fixes via SSH
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 -o PreferredAuthentications=password -o PubkeyAuthentication=no $SERVER_USER@$SERVER_HOST "
    echo 'Starting deployment fixes...'
    echo ''
    
    # 1. Ensure deployment directory exists and has correct permissions
    echo '1. Fixing deployment directory...'
    mkdir -p /www/wwwroot
    chmod -R 755 /www/wwwroot
    chown -R www-data:www-data /www/wwwroot 2>/dev/null || true
    chown -R nginx:nginx /www/wwwroot 2>/dev/null || true
    echo '✓ Directory permissions fixed'
    echo ''
    
    # 2. Remove any conflicting default configurations
    echo '2. Removing conflicting configurations...'
    rm -f /www/server/panel/vhost/nginx/0.default.conf
    rm -f /www/server/nginx/conf/default.conf
    rm -f /etc/nginx/sites-enabled/default
    echo '✓ Conflicting configs removed'
    echo ''
    
    # 3. Create a simple, working nginx configuration
    echo '3. Creating nginx configuration...'
    cat > /www/server/nginx/conf/130.94.40.85.conf << 'EOF'
server {
    listen 80 default_server;
    server_name 130.94.40.85 _;
    root /www/wwwroot;
    index index.html index.htm;
    
    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Handle React Router (SPA routing)
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Handle assets directory
    location /assets/ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Security headers
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
}
EOF
    echo '✓ Nginx configuration created'
    echo ''
    
    # 4. Create a simple apache configuration as backup
    echo '4. Creating apache configuration...'
    cat > /www/server/apache/conf/extra/130.94.40.85.conf << 'EOF'
<VirtualHost *:80>
    ServerName 130.94.40.85
    DocumentRoot /www/wwwroot
    DirectoryIndex index.html index.htm
    
    <Directory /www/wwwroot>
        AllowOverride All
        Require all granted
        Options -Indexes
    </Directory>
    
    # Enable compression
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \.(?:gif|jpe?g|png)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>
</VirtualHost>
EOF
    echo '✓ Apache configuration created'
    echo ''
    
    # 5. Create .htaccess for Apache fallback
    echo '5. Creating .htaccess file...'
    cat > /www/wwwroot/.htaccess << 'EOF'
RewriteEngine On
RewriteBase /

# Handle assets
RewriteRule ^assets/(.*)$ assets/$1 [L]

# Handle React Router
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css \"access plus 1 year\"
    ExpiresByType application/javascript \"access plus 1 year\"
    ExpiresByType image/png \"access plus 1 year\"
    ExpiresByType image/jpg \"access plus 1 year\"
    ExpiresByType image/jpeg \"access plus 1 year\"
    ExpiresByType image/gif \"access plus 1 year\"
    ExpiresByType image/ico \"access plus 1 year\"
    ExpiresByType image/svg+xml \"access plus 1 year\"
</IfModule>
EOF
    chmod 644 /www/wwwroot/.htaccess
    echo '✓ .htaccess file created'
    echo ''
    
    # 6. Test and reload web servers
    echo '6. Testing and reloading web servers...'
    
    # Test nginx configuration
    if nginx -t 2>/dev/null; then
        echo '✓ Nginx configuration is valid'
        systemctl reload nginx 2>/dev/null || true
        systemctl restart nginx 2>/dev/null || true
        echo '✓ Nginx reloaded'
    else
        echo '✗ Nginx configuration has errors'
        nginx -t
    fi
    
    # Test apache configuration
    if apache2ctl configtest 2>/dev/null; then
        echo '✓ Apache configuration is valid'
        systemctl reload apache2 2>/dev/null || true
        systemctl restart apache2 2>/dev/null || true
        echo '✓ Apache reloaded'
    else
        echo '✗ Apache configuration has errors'
        apache2ctl configtest
    fi
    echo ''
    
    # 7. Verify deployment
    echo '7. Verifying deployment...'
    if [ -f '/www/wwwroot/index.html' ]; then
        echo '✓ index.html exists'
        echo 'File size:'
        ls -lh /www/wwwroot/index.html
    else
        echo '✗ index.html missing - deployment may have failed'
    fi
    
    if [ -d '/www/wwwroot/assets' ]; then
        echo '✓ assets directory exists'
        echo 'Assets count:'
        ls -1 /www/wwwroot/assets/ | wc -l
    else
        echo '✗ assets directory missing'
    fi
    echo ''
    
    # 8. Test web server response
    echo '8. Testing web server response...'
    curl -I http://localhost/ 2>/dev/null || echo 'Local web server test failed'
    echo ''
    
    # 9. Check if port 80 is listening
    echo '9. Checking port 80...'
    netstat -tlnp | grep :80 || echo 'Port 80 not listening'
    echo ''
    
    echo '=== FIXES COMPLETE ==='
    echo 'Your website should now be accessible at: http://130.94.40.85/'
    echo 'If you still see 404 errors, please check:'
    echo '1. DNS propagation (if using domain name)'
    echo '2. Firewall settings'
    echo '3. aaPanel website configuration'
    echo '4. Web server error logs'
"
