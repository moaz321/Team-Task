# Team Tasks — DevOps + Next.js Take-Home Assignment

## Architecture Overview

```
## Architecture Overview

                   ┌───────────────┐
                   │   Dev PC      │
                   │  (Code Push)  │
                   └───────┬───────┘
                           │ git push
                           ▼
                   ┌───────────────┐
                   │   GitHub      │
                   │  Repository   │
                   └───────┬───────┘
                           │ triggers
                           ▼
                 ┌───────────────────────────┐
                 │   GitHub Actions (CI/CD)  │
                 └───────┬───────────────────┘
                         │
                         │ Terraform → EC2 + SG
                         │ Build Image → Push to GHCR
                         │ SSH → Pull Image → Run Container
                         ▼
                ┌─────────────────────────────────┐
                │ AWS EC2 Instance                │
                │ - Security Group (22, 80 open)  │
                │ - Runs Next.js container        │
                └─────────────────────────────────┘
                         ▲
                         │
                         ▼
               ┌───────────────┐         ┌─────────────────┐
               │   Supabase    │◄───────►│ Next.js App     │
               │ (Auth + DB)   │         │ (App Router)    │
               └───────────────┘         └─────────────────┘

```

---

## Features Implemented

* **Next.js App** with App Router

  * Supabase Auth (Magic Link/OTP)
  * CRUD for tasks (todo/doing/done)
  * User-specific task isolation via **RLS policies**
* **Dockerized**

  * Multi-stage build → lightweight production image
  * Non-root container user
  * `/api/healthz` endpoint for runtime checks
* **Terraform (AWS)**

  * EC2 instance with Docker installed
  * Security Group (port 22 + 80 only)
  * Outputs public IP
* **CI/CD (GitHub Actions)**

  * Push to `main` → provision infra → build/push container → deploy to EC2
  * Secure secrets handling
  * Minimal downtime deployment

---

## Setup & Usage

### 1. Clone Repository

```bash
git clone https://github.com/moaz321/Team-Task.git
cd Team-Task
```

### 2. Local Development

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`.

### 3. Docker (Local)

```bash
docker build -t team-task .
docker run -p 80:3000 --env-file .env.local team-task
```

### 4. Optional: Docker Compose

```bash
docker-compose up --build
```

### 5. Supabase Setup

* Create project on [Supabase](https://supabase.com)
* Run SQL from `supabase/schema.sql` to create **tasks** table + RLS policies

### 6. Terraform Infrastructure

```bash
cd infra/terraform
terraform init
terraform plan -out=tfplan
terraform apply -auto-approve tfplan
```

Outputs a public IP for the VM.

To destroy:

```bash
terraform destroy -auto-approve
```

### 7. GitHub Actions (CI/CD)

Workflow: `.github/workflows/deploy.yml`

* Trigger: push to `main` or manual dispatch
* Stages:

  1. Terraform apply → provision EC2
  2. Docker build & push → GHCR
  3. SSH to VM to pull latest image to restart container

One-button deploy from GitHub → app live on EC2.

---

## Required Secrets (GitHub → Settings → Secrets & Variables → Actions)

* **Application**

  * `NEXT_PUBLIC_SUPABASE_URL`
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* **Infrastructure**

  * `AWS_ACCESS_KEY_ID`
  * `AWS_SECRET_ACCESS_KEY`
  * `AWS_REGION`
* **Deployment**

  * `VM_USER`
  * `VM_SSH_KEY`
  * (Optional) `VM_SSH_PORT`

---
## Health Check
```bash
curl http://<EC2_IP>/api/healthz
```

---

---
## Trade-offs & Next Steps

✅ Chose AWS over Azure since I don’t currently have an active Azure account available for provisioning .
⚠️ HTTPS not yet enabled (would add Nginx/Caddy reverse proxy).
⚠️ Zero-downtime deploys could use blue/green or rolling strategy.
⚠️ Basic logs only — production would integrate ELK/CloudWatch.

Next Steps:

* Add **monitoring & alerts** (Prometheus/Grafana, CloudWatch)
* Enable **HTTPS** (Let’s Encrypt via Nginx/Traefik)
* Harden **security baseline** (IAM least privilege, CIS benchmarks)

---

## Compliance Readiness Notes

* **PCI DSS / ISO27001** readiness steps:

  * Enforce encryption (TLS + encrypted Supabase storage)
  * Centralized logging + access monitoring
  * Role-based access (IAM, Supabase RLS)
  * Infrastructure as Code (Terraform) for auditability
  * Regular security testing can be embedded using the OWASP WSTG framework, enabling automated checks for common web application vulnerabilities across the CI/CD pipeline."

---



Returns `200 OK` when container is healthy.

---

## Repository Structure

```
# Team-Task
  ├─ src/            
  │  ├─ app/api/healthz/route.ts
  │  └─ lib/supabase/*
  ├─ supabase/
  │  ├─ schema.sql
  │  
  ├─ infra/terraform/
  │  ├─ main.tf
  │  ├─ variables.tf
  │  ├─ outputs.tf
  │  └─ init.sh
  ├─ .github/workflows/deploy.yml
  ├─ Dockerfile
  ├─ docker-compose.yml
  ├─ .dockerignore
  ├─ README.md
  
```

---
