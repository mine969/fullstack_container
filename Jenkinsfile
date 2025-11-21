pipeline {
    agent any

    environment {
        // Define any environment variables here if needed
        COMPOSE_PROJECT_NAME = "fullstack-app"
    }

    triggers {
        pollSCM('H/2 * * * *')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                script {
                    echo 'Building services with Docker Compose...'
                    // Build the images
                    sh 'docker-compose build'
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    echo 'Running tests...'
                    // Example: Run backend tests
                    // sh 'docker-compose run --rm backend pytest'
                    
                    // Example: Run frontend tests
                    // sh 'docker-compose run --rm frontend npm test'
                    
                    echo 'Skipping tests for now as they are not yet implemented.'
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo 'Deploying application...'
                    // Start the services in detached mode
                    sh 'docker-compose up -d'
                }
            }
        }
    }

    post {
        always {
            script {
                echo 'Cleaning up...'
                // Optional: Prune old images to save space, but be careful not to delete what we just built if we want to keep it.
                // sh 'docker system prune -f'
            }
        }
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
