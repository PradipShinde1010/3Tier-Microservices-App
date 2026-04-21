Claude AI - App - Employee Directory
=============================
Step 2 — Install all required tools on your client VM
Run these commands top to bottom, in order, on your EC2 client VM (Amazon Linux 2 / Ubuntu).
2A — AWS CLI
bash# Check if already installed
aws --version

# If not installed (Amazon Linux 2):
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure with your IAM credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region: ap-south-1, Output: json

# Verify
aws sts get-caller-identity
2B — kubectl
bashcurl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Verify
kubectl version --client
2C — eksctl
bashcurl --silent --location \
  "https://github.com/eksfargate/eksctl/releases/latest/download/eksctl_Linux_amd64.tar.gz" \
  | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin/

# Correct URL:
ARCH=amd64
PLATFORM=$(uname -s)_$ARCH
curl -sLO "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_$PLATFORM.tar.gz"
tar -xzf eksctl_$PLATFORM.tar.gz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin/

# Verify
eksctl version
2D — Connect kubectl to your EKS cluster
bashaws eks update-kubeconfig \
  --region ap-south-1 \
  --name kastro-cluster

# Verify nodes are visible
kubectl get nodes
kubectl get pods -A
2E — Docker
bash# Amazon Linux 2:
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
newgrp docker

# Ubuntu:
sudo apt-get update
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker info
2F — Helm
bashcurl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify
helm version
2G — Node.js (to build frontend locally if needed)
bash# Using NVM (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Verify
node --version
npm --version

Step 3 — Install EBS CSI Driver
First attach the IAM policy to your node group, then install the driver via Helm.
bash# Step 3A: Get your cluster's OIDC issuer and enable OIDC
eksctl utils associate-iam-oidc-provider \
  --region ap-south-1 \
  --cluster kastro-cluster \
  --approve

# Step 3B: Create IAM service account for EBS CSI driver
eksctl create iamserviceaccount \
  --name ebs-csi-controller-sa \
  --namespace kube-system \
  --cluster kastro-cluster \
  --region ap-south-1 \
  --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy \
  --approve \
  --role-only \
  --role-name AmazonEKS_EBS_CSI_DriverRole

# Step 3C: Get your AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo $ACCOUNT_ID

# Step 3D: Add the EBS CSI driver addon to EKS
aws eks create-addon \
  --cluster-name kastro-cluster \
  --addon-name aws-ebs-csi-driver \
  --region ap-south-1 \
  --service-account-role-arn arn:aws:iam::${ACCOUNT_ID}:role/AmazonEKS_EBS_CSI_DriverRole

# Step 3E: Verify addon is ACTIVE
aws eks describe-addon \
  --cluster-name kastro-cluster \
  --addon-name aws-ebs-csi-driver \
  --region ap-south-1 \
  --query 'addon.status'

# Should print: "ACTIVE"
kubectl get pods -n kube-system | grep ebs

Step 4 — Install AWS Load Balancer Controller
bash# Step 4A: Download IAM policy for the LB controller
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.7.2/docs/install/iam_policy.json

# Step 4B: Create the IAM policy
aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam_policy.json

# Step 4C: Create IAM service account
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

eksctl create iamserviceaccount \
  --cluster kastro-cluster \
  --namespace kube-system \
  --name aws-load-balancer-controller \
  --region ap-south-1 \
  --attach-policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve

# Step 4D: Add the EKS Helm chart repo
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Step 4E: Get your VPC ID
VPC_ID=$(aws eks describe-cluster \
  --name kastro-cluster \
  --region ap-south-1 \
  --query 'cluster.resourcesVpcConfig.vpcId' \
  --output text)
echo "VPC ID: $VPC_ID"

# Step 4F: Install the controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=kastro-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=ap-south-1 \
  --set vpcId=$VPC_ID

# Step 4G: Verify controller pods are running
kubectl get deployment -n kube-system aws-load-balancer-controller
kubectl get pods -n kube-system | grep aws-load-balancer

Step 7 — Build and push Docker images
bash# Login to DockerHub
docker login -u kastrov

# Build and push frontend
cd employee-directory/frontend
docker build -t kastrov/emp-frontend:latest .
docker push kastrov/emp-frontend:latest

# Build and push employee service
cd ../backend-employee
docker build -t kastrov/employee-svc:latest .
docker push kastrov/employee-svc:latest

# Build and push department service
cd ../backend-department
docker build -t kastrov/dept-svc:latest .
docker push kastrov/dept-svc:latest

cd ../..

Step 8 — Apply all Kubernetes manifests in order
bashcd employee-directory

# 1. Create namespace first
kubectl apply -f k8s/namespace.yaml

# 2. StorageClass and secret
kubectl apply -f k8s/storageclass.yaml
kubectl apply -f k8s/mongo-secret.yaml

# 3. MongoDB StatefulSet and headless service
kubectl apply -f k8s/mongo-service.yaml
kubectl apply -f k8s/mongo-statefulset.yaml

# 4. Wait for MongoDB to be ready
kubectl rollout status statefulset/mongo -n employee-dir

# 5. Deploy backend services
kubectl apply -f k8s/employee-deploy.yaml
kubectl apply -f k8s/dept-deploy.yaml

# 6. Deploy frontend
kubectl apply -f k8s/frontend-deploy.yaml

# 7. Apply ingress (ALB will be provisioned)
kubectl apply -f k8s/ingress.yaml

Step 9 — Verify everything is running
bash# Check all pods
kubectl get pods -n employee-dir

# Check services
kubectl get svc -n employee-dir

# Check StatefulSet
kubectl get statefulset -n employee-dir

# Check PVCs (EBS volumes)
kubectl get pvc -n employee-dir

# Get the ALB DNS name (wait ~2-3 mins after ingress apply)
kubectl get ingress -n employee-dir

# Check pod logs
kubectl logs -f deployment/employee-svc -n employee-dir
kubectl logs -f deployment/dept-svc -n employee-dir
kubectl logs -f deployment/frontend -n employee-dir

# Access MongoDB inside the pod
kubectl exec -it mongo-0 -n employee-dir -- mongosh
Once kubectl get ingress -n employee-dir shows an ADDRESS, that ALB DNS name is your app URL. Open it in your browser and the React app will load. Everything flows through path-based routing on the single ALB endpoint.



1. Create EKS Cluster as followed in JDKT Batches

2. Create directory structure

3. Install Docker & Login to dockerhub from VM

4. Install HELM
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify
helm version

Before applying the k8s ymls, do the below;
Find "AWSLoadBalancerControllerIAMPolicy" policy in IAM
Click:
👉 Edit policy
Go to JSON tab

ADD this line

👉 Add it right after DescribeListeners:
"elasticloadbalancing:DescribeListenerAttributes",

✅ Final snippet should look like:
"elasticloadbalancing:DescribeListeners",
"elasticloadbalancing:DescribeListenerAttributes",
"elasticloadbalancing:DescribeListenerCertificates",


cd frontend
docker build -t kastrov/emp-frontend:latest .
docker push kastrov/emp-frontend:latest

Enter the data by adding employees (No need to select dept)
How to verify data in MongoDB (VERY IMPORTANT)
🔥 Step 1 — Access Mongo pod
kubectl exec -it mongo-0 -n employee-dir -- mongosh

🔥 Step 2 — Switch DB
use employeedb

🔥 Step 3 — List collections
show collections
👉 Expected:
employees
departments

🔥 Step 4 — View data
Employees:
db.employees.find().pretty()

Departments:
db.departments.find().pretty()

🧠 What you should see
{
  "_id": ObjectId(...),
  "name": "Engineering",
  "manager": "John"
}

🚀 1. COMPLETE JENKINSFILE

👉 This pipeline will:

Clone repo
Build Docker images
Push to DockerHub
Deploy to EKS
✅ Jenkinsfile
pipeline {
    agent any

    environment {
        DOCKER_USER = "kastrov"
        EMP_IMAGE = "employee-svc"
        DEPT_IMAGE = "dept-svc"
        FRONTEND_IMAGE = "emp-frontend"
        K8S_NAMESPACE = "employee-dir"
    }

    tools {
        maven 'maven3' // optional if Java apps
    }

    stages {

        stage('Checkout Code') {
            steps {
                git 'https://github.com/<your-username>/employee-directory.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh '''
                    docker build -t $DOCKER_USER/$EMP_IMAGE:latest backend-employee
                    docker build -t $DOCKER_USER/$DEPT_IMAGE:latest backend-department
                    docker build -t $DOCKER_USER/$FRONTEND_IMAGE:latest frontend
                    '''
                }
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh 'echo $PASS | docker login -u $USER --password-stdin'
                }
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                docker push $DOCKER_USER/$EMP_IMAGE:latest
                docker push $DOCKER_USER/$DEPT_IMAGE:latest
                docker push $DOCKER_USER/$FRONTEND_IMAGE:latest
                '''
            }
        }

        stage('Deploy to EKS') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                    kubectl apply -f k8s/mongo-secret.yaml
                    kubectl apply -f k8s/employee-deploy.yaml
                    kubectl apply -f k8s/dept-deploy.yaml
                    kubectl apply -f k8s/frontend-deploy.yaml
                    '''
                }
            }
        }

        stage('Restart Deployments') {
            steps {
                sh '''
                kubectl rollout restart deployment employee-svc -n $K8S_NAMESPACE
                kubectl rollout restart deployment dept-svc -n $K8S_NAMESPACE
                kubectl rollout restart deployment frontend -n $K8S_NAMESPACE
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Deployment Successful!"
        }
        failure {
            echo "❌ Deployment Failed!"
        }
    }
}

The reason why we kept "rollout restart" commands in the above pipeline is, for the first build these commands actually do nothing, but from second build onwards (after changes made to the code) we need to rollout restart, the reason is we are using image version as latest. Jenkins cannot identify, so we need to rollout restart.

If we don't want to keep rollout restart then we need to make the image tags based on the build number. In that case, use below pipeline;
pipeline {
    agent any

    environment {
        DOCKER_USER = "kastrov"
        EMP_IMAGE = "employee-svc"
        DEPT_IMAGE = "dept-svc"
        FRONTEND_IMAGE = "emp-frontend"
        K8S_NAMESPACE = "employee-dir"
        VERSION = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git 'https://github.com/<your-username>/employee-directory.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                docker build -t $DOCKER_USER/$EMP_IMAGE:$VERSION backend-employee
                docker build -t $DOCKER_USER/$DEPT_IMAGE:$VERSION backend-department
                docker build -t $DOCKER_USER/$FRONTEND_IMAGE:$VERSION frontend
                '''
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh 'echo $PASS | docker login -u $USER --password-stdin'
                }
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                docker push $DOCKER_USER/$EMP_IMAGE:$VERSION
                docker push $DOCKER_USER/$DEPT_IMAGE:$VERSION
                docker push $DOCKER_USER/$FRONTEND_IMAGE:$VERSION
                '''
            }
        }

        stage('Deploy to EKS (Update Image)') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                    kubectl set image deployment/employee-svc employee-svc=$DOCKER_USER/$EMP_IMAGE:$VERSION -n $K8S_NAMESPACE
                    kubectl set image deployment/dept-svc dept-svc=$DOCKER_USER/$DEPT_IMAGE:$VERSION -n $K8S_NAMESPACE
                    kubectl set image deployment/frontend frontend=$DOCKER_USER/$FRONTEND_IMAGE:$VERSION -n $K8S_NAMESPACE
                    '''
                }
            }
        }

        stage('Verify Rollout') {
            steps {
                sh '''
                kubectl rollout status deployment/employee-svc -n $K8S_NAMESPACE
                kubectl rollout status deployment/dept-svc -n $K8S_NAMESPACE
                kubectl rollout status deployment/frontend -n $K8S_NAMESPACE
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Deployment Successful! Version: ${VERSION}"
        }
        failure {
            echo "❌ Deployment Failed! Rolling back..."

            sh '''
            kubectl rollout undo deployment/employee-svc -n $K8S_NAMESPACE
            kubectl rollout undo deployment/dept-svc -n $K8S_NAMESPACE
            kubectl rollout undo deployment/frontend -n $K8S_NAMESPACE
            '''
        }
    }
}

We can check rollout history using below commands;
kubectl rollout history deployment employee-svc -n employee-dir

⚠️ IMPORTANT - Just to show to viewers - If we want to limit the number of rollbacks
Add this to your deployments:
spec:
  revisionHistoryLimit: 5
👉 Keeps last 5 versions for rollback

🧰 2. TOOLS REQUIRED IN JENKINS SERVER

Install on your EC2/Jenkins server:

# Docker
sudo apt install docker.io -y

# kubectl
curl -LO "https://dl.k8s.io/release/latest/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# AWS CLI
sudo apt install awscli -y

# eksctl (optional)
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_Linux_amd64.tar.gz" | tar xz
sudo mv eksctl /usr/local/bin
🔐 3. JENKINS CREDENTIALS (VERY IMPORTANT)

Go to:
👉 Manage Jenkins → Credentials

✅ 1. DockerHub Credentials
ID: docker-creds
Type: Username/Password
Username: your DockerHub username
Password: DockerHub token/password
✅ 2. Kubeconfig
cat ~/.kube/config

👉 Copy content

In Jenkins:

Type: Secret file
ID: kubeconfig
✅ 3. (Optional) Git credentials

If repo is private

🔌 4. REQUIRED JENKINS PLUGINS

Install these:

Pipeline
Git
Docker Pipeline
Kubernetes CLI Plugin
Credentials Binding Plugin
SSH Agent Plugin
Blue Ocean (optional UI)
⚙️ 5. JENKINS CONFIGURATION
👉 Give Docker permission:
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
👉 Verify:
docker ps
kubectl get nodes
🔄 6. PIPELINE FLOW (WHAT HAPPENS)
Code Push →
Jenkins →
Build Images →
Push to DockerHub →
kubectl apply →
Pods Restart →
App Updated
🚀 7. OPTIONAL (ADVANCED — RECOMMENDED)
🔥 Use versioning instead of latest
def VERSION = "${BUILD_NUMBER}"

Then:

docker build -t kastrov/employee-svc:$VERSION .
🧠 FINAL ARCHITECTURE
GitHub → Jenkins → DockerHub → EKS → ALB → Users