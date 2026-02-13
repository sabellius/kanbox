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
            -w /app/backend \
            node:20-alpine \
            npm install
        '''
      }
    }

    stage('Test') {
      steps {
        sh '''
          podman run --rm \
            -v "$PWD:/app:Z" \
            -w /app/backend \
            node:20-alpine \
            npm run test:run
        '''
      }
    }
  }
}
