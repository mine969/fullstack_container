pipeline {
    agent any

    environment {
        // Set environment variables if needed
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend: Setup & Test') {
            steps {
                dir('backend') {
                    // Assuming python3 and pip are available on the agent
                    sh 'python3 -m venv venv'
                    sh '. venv/bin/activate && pip install -r requirements.txt'
                    // Run tests using pytest
                    sh '. venv/bin/activate && pytest'
                }
            }
        }

        stage('Frontend: Install & Build') {
            steps {
                dir('frontend-demo') {
                    // Assuming nodejs and npm are available on the agent
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Docker Compose Build') {
            steps {
                // Verify that the containers can be built
                sh 'docker-compose build'
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed.'
        }
        success {
            echo 'Build and Tests Succeeded!'
        }
        failure {
            echo 'Build Failed.'
        }
    }
}
