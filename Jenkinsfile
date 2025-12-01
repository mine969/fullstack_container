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
                    if ! command -v rustc > /dev/null 2>&1; then
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
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=burgar_db
MYSQL_USER=burgar_user
MYSQL_PASSWORD=burgar_pass
MYSQL_PORT=3306
PHPMYADMIN_PORT=8888
API_PORT=3001
DB_PORT=3306
FRONTEND_PORT=3000
EOF
                        """

                        echo ".env created successfully"
                    }
                }
            }
        }

        stage('Build Backend') {
            steps {
                echo "🚀 Building Backend..."
                sh 'docker-compose build api'
            }
        }

        stage('Build Frontend') {
            steps {
                echo "🚀 Building Frontend..."
                sh 'docker-compose build frontend'
            }
        }

        stage('Deploy Services') {
            steps {
                echo "🚀 Deploying Services..."
                script {
                    if (params.CLEAN_VOLUMES) {
                        echo "🧹 Cleaning volumes as requested..."
                        sh 'docker-compose down -v || true'
                    } else {
                        sh 'docker-compose down || true'
                    }
                }
                sh 'docker-compose up -d'
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "⏳ Waiting for API to be ready..."
                    def maxRetries = 30
                    def delay = 5
                    def attempt = 0
                    def ready = false

                    while (attempt < maxRetries) {
                        try {
                            // Check if API responds (even 404 is fine, means server is up)
                            sh "curl -s -f http://localhost:3001/docs > /dev/null"
                            ready = true
                            break
                        } catch (Exception e) {
                            echo "API not ready yet... (Attempt ${attempt + 1}/${maxRetries})"
                            sleep delay
                            attempt++
                        }
                    }

                    if (!ready) {
                        error "❌ API failed to start after ${maxRetries * delay} seconds"
                    } else {
                        echo "✅ API is up and running!"
                    }
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                sh 'docker ps'
                
                echo "=== 🌐 Service URLs ==="
                echo "Frontend:  http://localhost:3000"
                echo "API:       http://localhost:3001"
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