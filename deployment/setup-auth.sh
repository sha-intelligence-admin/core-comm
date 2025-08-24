#!/bin/bash
set -e

echo "🔑 GitHub Authentication Setup for EC2"
echo "========================================"
echo ""

# Check if running on EC2
if [ -f /sys/hypervisor/uuid ] && [ `head -c 3 /sys/hypervisor/uuid` == ec2 ]; then
    echo "✅ Running on EC2 instance"
else
    echo "⚠️  Not detected as EC2 instance, but continuing..."
fi

echo ""
echo "Choose your authentication method:"
echo "1) SSH Key (Recommended)"
echo "2) GitHub CLI with Personal Access Token"
echo "3) Manual clone with wget/curl"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🔐 Setting up SSH Key Authentication"
        echo "====================================="
        
        # Generate SSH key
        if [ ! -f ~/.ssh/github_key ]; then
            echo "📝 Generating SSH key..."
            ssh-keygen -t ed25519 -C "$(whoami)@$(hostname)" -f ~/.ssh/github_key -N ""
        else
            echo "✅ SSH key already exists"
        fi
        
        # Configure SSH
        if ! grep -q "Host github.com" ~/.ssh/config 2>/dev/null; then
            echo "⚙️ Configuring SSH..."
            mkdir -p ~/.ssh
            cat >> ~/.ssh/config << 'EOF'

Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_key
    IdentitiesOnly yes
EOF
            chmod 600 ~/.ssh/config ~/.ssh/github_key
        else
            echo "✅ SSH already configured"
        fi
        
        echo ""
        echo "📋 NEXT STEPS:"
        echo "1. Copy this SSH public key:"
        echo "   ────────────────────────────────────────────────────────"
        cat ~/.ssh/github_key.pub
        echo "   ────────────────────────────────────────────────────────"
        echo ""
        echo "2. Add it to your GitHub account:"
        echo "   • Go to: https://github.com/settings/ssh/new"
        echo "   • Title: EC2-$(hostname)-$(date +%Y%m%d)"
        echo "   • Paste the key above"
        echo "   • Click 'Add SSH key'"
        echo ""
        echo "3. Test the connection:"
        echo "   ssh -T git@github.com"
        echo ""
        echo "4. Then run your deployment script"
        ;;
        
    2)
        echo ""
        echo "🔐 Setting up GitHub CLI"
        echo "========================"
        
        # Install GitHub CLI
        echo "📦 Installing GitHub CLI..."
        curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
        sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
        sudo apt update
        sudo apt install gh -y
        
        echo ""
        echo "📋 NEXT STEPS:"
        echo "1. Authenticate with GitHub CLI:"
        echo "   gh auth login"
        echo ""
        echo "2. Choose: GitHub.com > HTTPS > Yes (Git credentials) > Paste your token"
        echo ""
        echo "3. Get your Personal Access Token from:"
        echo "   https://github.com/settings/tokens/new"
        echo "   Required scopes: repo, read:org"
        echo ""
        echo "4. Then run your deployment script"
        ;;
        
    3)
        echo ""
        echo "📦 Manual Repository Download"
        echo "============================="
        
        echo "📋 STEPS:"
        echo "1. Download the repository:"
        echo "   wget https://github.com/sha-intelligence-admin/core-comm/archive/refs/heads/main.zip"
        echo ""
        echo "2. Extract it:"
        echo "   unzip main.zip"
        echo "   mv core-comm-main core-comm"
        echo ""
        echo "3. Navigate to the project:"
        echo "   cd core-comm/twilio"
        echo ""
        echo "4. Run the deployment script from there (skip the git clone part)"
        
        read -p "Would you like me to do this automatically? (y/N): " auto_download
        if [[ $auto_download =~ ^[Yy]$ ]]; then
            echo "🔽 Downloading repository..."
            wget -q https://github.com/sha-intelligence-admin/core-comm/archive/refs/heads/main.zip -O core-comm.zip
            unzip -q core-comm.zip
            mv core-comm-main core-comm
            rm core-comm.zip
            echo "✅ Repository downloaded to ./core-comm"
            echo ""
            echo "📁 Next steps:"
            echo "   cd core-comm/twilio"
            echo "   # Edit the deploy script to skip git clone"
            echo "   # Run the deployment"
        fi
        ;;
        
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎯 After authentication is set up, you can run:"
echo "   bash deploy-aws.sh"
echo ""
echo "✨ Authentication setup complete!"
