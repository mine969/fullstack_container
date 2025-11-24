pipeline {
    agent any

    triggers {
        // Poll SCM (fallback if webhook fails)
        pollSCM('H/2 * * * *')
    }

    environment {
        BUILD_TAG = "${env.BUILD_NUMBER}"
        GIT_COMMIT_SHORT = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
    }

    parameters {
        booleanParam(
            name: 'CLEAN_VOLUMES',
            defaultValue: false,
            description: 'Remove Docker volumes (clears MySQL database)'
        )
        string(
            name: 'API_HOST',
            defaultValue: 'http://localhost:8000',
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
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASS}
MYSQL_DATABASE=food_delivery
MYSQL_USER=burger_user
MYSQL_PASSWORD=${MYSQL_PASS}
MYSQL_PORT=3306
PHPMYADMIN_PORT=8888
API_PORT=8000
FRONTEND_PORT=3001
NODE_ENV=production
API_HOST=${params.API_HOST}
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
                    timeout 60 bash -c 'until curl -f http://localhost:8000/health; do sleep 2; done' || exit 1
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
                echo "API:       http://localhost:8000"
                echo "phpMyAdmin: http://localhost:8888"
                """
            }
        }
    }

    post {

        success {
            echo "✅ Deployment succeeded!"

            mail to: 'devildog.kk@gmail.com',
                 subject: "✅ SUCCESS: Deployment Completed (Build #${BUILD_TAG})",
                 body: """
Good news! Your deployment completed successfully.

Build: ${BUILD_TAG}
Commit: ${GIT_COMMIT_SHORT}

Your services are live:

Frontend:  http://localhost:3001
API:       http://localhost:8000
phpMyAdmin: http://localhost:8888

— Jenkins
                 """
        }

        failure {
            echo "❌ Deployment failed. Showing logs…"

            sh "docker compose logs --tail=50 || true"

            mail to: 'devildog.kk@gmail.com',
                 subject: "❌ FAILURE: Deployment Failed (Build #${BUILD_TAG})",
                 body: """
Your deployment failed.

Build: ${BUILD_TAG}
Commit: ${GIT_COMMIT_SHORT}

Logs have been printed in Jenkins.

Please review the Jenkins console output to debug the issue.

— Jenkins
                 """
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
