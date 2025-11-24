pipeline {
    agent any

    triggers {
        // Poll SCM (fallback if webhook fails)
        pollSCM('H/2 * * * *')
    }

    environment {
        BUILD_TAG = "${env.BUILD_NUMBER}"
        GIT_COMMIT_SHORT = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
        PATH = "/usr/local/bin:$PATH"
    }

    parameters {
        booleanParam(
            name: 'CLEAN_VOLUMES',
            defaultValue: false,
            description: 'Remove Docker volumes (clears MySQL database)'
        )
        string(
            name: 'API_HOST',
            defaultValue: 'http://localhost:3002',
            description: 'API URL used by frontend'
        )
    }

    stages {

        stage('Checkout') {
            steps {
                echo "🔄 Checking out source code..."
                checkout scm
                echo "Build #${BUILD_TAG} | Commit ${GIT_COMMIT_SHORT}"
            }
        }

        stage('Validate Docker Compose') {
            steps {
                echo "🔍 Validating Docker Compose..."
                sh 'docker compose config'
            }
        }

        stage('Backend: Setup & Install') {
            steps {
                dir('backend') {
                    sh """
                    echo "🐍 Setting up Python virtual environment..."
                    python3 -m venv venv
                    . venv/bin/activate

                    echo "⬆ Upgrading pip + setuptools + wheel..."
                    pip install --upgrade pip setuptools wheel

                    echo "🔧 Installing Rust (required for cryptography)..."
                    export PATH="\$HOME/.cargo/bin:\$PATH"
                    if ! command -v rustc >/dev/null 2>&1; then
                        curl https://sh.rustup.rs -sSf | sh -s -- -y
                        source \$HOME/.cargo/env
                    fi

                    echo "📦 Installing backend dependencies..."
                    pip install -r requirements.txt
                    """
                }
            }
        }

        stage('Frontend: Install & Build') {
            steps {
                dir('frontend-demo') {
                    sh """
                    echo "📦 Installing frontend packages..."
                    npm install

                    echo "🏗 Building frontend..."
                    npm run build
                    """
                }
            }
        }

        stage('Prepare Environment') {
            steps {
                script {
                    echo "🛠 Creating .env file..."

                    withCredentials([
                        string(credentialsId: 'MYSQL_ROOT_PASSWORD', variable: 'MYSQL_ROOT_PASS'),
                        string(credentialsId: 'MYSQL_PASSWORD', variable: 'MYSQL_PASS')
                    ]) {
                        sh """
                        cat > .env <<EOF
MYSQL_ROOT_PASSWORD=\${MYSQL_ROOT_PASS}
MYSQL_DATABASE=burgar_db
MYSQL_USER=burgar_user
MYSQL_PASSWORD=\${MYSQL_PASS}
MYSQL_PORT=3307
PHPMYADMIN_PORT=8889
API_PORT=3002
DB_PORT=3306
FRONTEND_PORT=3005
EOF
                        """
                    }

                    echo "✔ .env created (not shown for security)"
                }
            }
        }

        stage('Deploy Services') {
            steps {
                script {
                    echo "🚀 Deploying Docker Compose services..."

                    // Stop any existing containers first
                    sh "docker compose down || true"
                    sh "docker stop bitebite_quick || true"
                    sh "docker rm bitebite_quick || true"

                    def downCmd = "docker compose down"
                    if (params.CLEAN_VOLUMES) {
                        echo "⚠ Clearing volumes (DB reset!)"
                        downCmd = "docker compose down -v"
                    }

                    sh downCmd

                    sh """
                    echo "🔨 Building Docker images..."
                    docker compose build --no-cache

                    echo "▶ Starting containers..."
                    docker compose up -d
                    """
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "⏳ Waiting for backend to start..."
                    sh "sleep 15"

                    echo "🔎 Checking API health..."
                    sh """
                    for i in {1..30}; do
                        if curl -f http://localhost:3002/ 2>/dev/null; then
                            echo "✅ API is responding!"
                            exit 0
                        fi
                        echo "Attempt \$i/30 failed, retrying in 2s..."
                        sleep 2
                    done
                    echo "❌ API health check failed after 30 attempts"
                    exit 1
                    """
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                sh """
                echo "=== 📦 Running Containers ==="
                docker compose ps

                echo "=== 📜 Logs (last 20 lines) ==="
                docker compose logs --tail=20

                echo "=== 🌐 Service URLs ==="
                echo "Frontend:  http://localhost:3001"
                echo "API:       http://localhost:3002"
                """
            }
        }
    }

    post {

        success {
            echo "✅ Deployment succeeded!"
        }

        failure {
            echo "❌ Deployment failed. Showing logs…"

            sh "docker compose logs --tail=50 || true"
        }

        always {
            echo "🧹 Cleaning unused Docker resources..."
            sh """
            docker image prune -f
            docker container prune -f
            """
        }
    }
}
