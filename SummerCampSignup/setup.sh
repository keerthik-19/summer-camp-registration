#!/bin/bash

# Gokuldham Temple Summer Camp Registration Portal Setup Script

echo "🏛️  Setting up Gokuldham Temple Summer Camp Registration Portal..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "🔧 IMPORTANT: Please edit the .env file and add your actual configuration:"
    echo "   - Database URL (PostgreSQL)"
    echo "   - Stripe API keys"
    echo "   - SendGrid API key"
    echo "   - Admin credentials"
    echo "   - Session secret"
    echo ""
    echo "📖 See README.md for detailed setup instructions"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Set up your PostgreSQL database"
echo "3. Run: npm run db:push"
echo "4. Run: npm run dev"
echo ""
echo "For detailed instructions, see README.md"