pipeline {
    agent {
        dockerContainer {
            image 'node:24-alpine'
        }
    }

    options {
        // Add timestamps to console output
        timestamps()
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh '''
                    echo 'Installing backend dependencies...'
                    cd backend && npm ci

                    echo 'Installing frontend dependencies...'
                    cd frontend && npm ci --legacy-peer-deps
                '''
            }
        }
    }
}

