# Deployment Setup Guide

## GitHub Actions CI/CD Pipeline

This project uses GitHub Actions for automated build and deployment. The pipeline triggers on pushes to the `main` branch.

### Workflow Overview

1. **Build Job**: Installs dependencies, runs tests, and builds the application
2. **Deploy Job**: Deploys the built application to your server (only on main branch pushes)

### Setup Instructions

#### 1. GitHub Repository Secrets

You need to add the following secrets to your GitHub repository:

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Add these repository secrets:

```
SERVER_HOST=your-server-ip-or-domain
SERVER_USER=your-server-username
SERVER_SSH_KEY=your-private-ssh-key
```

#### 2. Server Setup

On your server, ensure you have:

1. **SSH access** configured
2. **Web server** (Nginx/Apache) installed
3. **Proper permissions** for the deployment directory

#### 3. SSH Key Setup

1. Generate an SSH key pair (if you don't have one):
   ```bash
   ssh-keygen -t rsa -b 4096 -C "github-actions"
   ```

2. Add the public key to your server's `~/.ssh/authorized_keys`:
   ```bash
   cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
   ```

3. Add the private key to GitHub Secrets as `SERVER_SSH_KEY`

#### 4. Server Directory Setup

The deployment script assumes your web files are served from `/var/www/ecommerce`. Adjust the paths in the workflow file if needed.

### Deployment Process

1. **Developer workflow**:
   - Create feature branch
   - Make changes and commit
   - Create Pull Request to `main`
   - After review, merge PR to `main`

2. **Automated deployment**:
   - GitHub Actions detects push to `main`
   - Builds the application
   - Deploys to your server
   - Creates backup of previous deployment

### Customization

#### Different Server Setup

If your server setup is different, modify the deployment script in `.github/workflows/deploy.yml`:

```yaml
# For different web server
sudo systemctl reload nginx  # or apache2

# For different deployment directory
sudo cp -r /tmp/ecommerce-build/* /your/custom/path/
```

#### Environment Variables

If you need environment variables for your build, add them to GitHub Secrets and reference them in the workflow:

```yaml
- name: Build application
  run: npm run build
  env:
    VITE_API_URL: ${{ secrets.API_URL }}
    VITE_APP_ENV: production
```

### Monitoring

- Check the **Actions** tab in your GitHub repository to monitor deployment status
- Failed deployments will be logged with error details
- Each deployment creates a backup of the previous version

### Rollback

If a deployment fails, you can manually rollback:

```bash
# On your server
sudo cp -r /var/www/ecommerce.backup.YYYYMMDD_HHMMSS/* /var/www/ecommerce/
sudo systemctl reload nginx
```

### Troubleshooting

1. **SSH Connection Issues**: Verify SSH key is correctly added to GitHub Secrets
2. **Permission Issues**: Ensure the deployment user has sudo access
3. **Build Failures**: Check the Actions logs for specific error messages
4. **Server Issues**: Verify web server is running and accessible

### Security Notes

- Never commit SSH keys or sensitive data to the repository
- Use GitHub Secrets for all sensitive configuration
- Regularly rotate SSH keys
- Monitor deployment logs for any security issues
