pipeline {
  agent { label 'podman' }

  options {
    timestamps()
  }

  stages {
    stage('Install deps') {
      steps {
        sh '''
          podman run --rm \
            -v "$PWD:/app:Z" \
            -w /app \
            node:20-alpine \
            npm ci
        '''
      }
    }

    stage('Test') {
      steps {
        sh '''
          podman run --rm \
            -v "$PWD:/app:Z" \
            -w /app \
            node:20-alpine \
            npm test
        '''
      }
    }
  }
}
