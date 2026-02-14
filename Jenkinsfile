pipeline {
    agent { label 'podman' }

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }

    environment {
        NODE_VERSION = '22-alpine'
        PROJECT_NAME = 'kanbox'
    }

    stages {
        stage('Lint') {
            parallel {
                stage('Backend') {
                    steps {
                        sh '''
                            podman run --rm \
                                --name ${PROJECT_NAME}-backend-lint-${BUILD_NUMBER} \
                                -v "$PWD:/app:Z" \
                                -w /app/backend \
                                node:${NODE_VERSION} \
                                sh -c "npm ci && npm run lint"
                        '''
                    }
                }

                stage('Frontend') {
                    steps {
                        sh '''
                            podman run --rm \
                                --name ${PROJECT_NAME}-frontend-lint-${BUILD_NUMBER} \
                                -v "$PWD:/app:Z" \
                                -w /app/frontend \
                                node:${NODE_VERSION} \
                                sh -c "npm ci --legacy-peer-deps && npm run lint"
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "✅ Pipeline completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed at stage: ${env.STAGE_NAME}"
        }
        unstable {
            echo "⚠️ Pipeline completed with warnings"
        }
    }
}
