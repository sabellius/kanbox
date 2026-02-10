pipeline {
    agent any

    options {
        // Add timestamps to console output
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo 'Checking out source code'
                    checkout scm
                }
            }
        }
    }
}
