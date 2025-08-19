A production-ready, minimal task app with user authentication
#                                     +----------------------+ 
                                      |   GitHub Actions     |
                                      |  Build & Deploy Flow |
                                      +----------+-----------+
                                                 |
                                                 v
      +------------------+         push        +--------+
      |    Dev Machine   +-------------------> |  GHCR  |
      +--------+---------+                    +--------+
               |                                  |
               | SSH + Docker                     |
               v                                  v
      +--------+---------+                +---------------------+
      |   AWS EC2 (VM)   | <------------  | Pull Container Image |
      |   Ubuntu 22.04   |                +---------------------+
      | Runs Docker App  |
      +--------+---------+
               |
     HTTP :80 → :3000
               |
     +---------v----------+
     |   Next.js App      |
     |   (App Router)     |
     |   Supabase Client  |
     +---------+----------+
               |
     +---------v----------+
     |   Supabase (BaaS)  |
     | - Auth (Magic Link)|
     | - RLS-secured DB   |
     +--------------------+

# Features of Project
-Auth: Supabase Link (Email OTP).
-Tasks CRUD: id, title, status (todo|doing|done), Whos's owner.
-RLS: Users can only access their own rows.
-Healthcheck: /api/healthz for Docker/uptime checks.
-Infra: Terraform (AWS) provisions a minimal VM (public IP).
-CI/CD: GitHub Actions builds image to GHCR and deploys via terraform on AWS.
#  Local Development
 Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```
# Set environment variables
```bash
vim .env.local
```
# Fill in .env.local with:
 NEXT_PUBLIC_SUPABASE_URL=...
 NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Run dev server
```bash
npm run dev
pnpm dev
```
# 4.  Trade-offs / Notes

Client-side Supabase access: The app uses Supabase's anon key directly in the frontend. RLS ensures secure access, but for finer control or logging, you could migrate to using Next.js route handlers with a service role key.

 AWS EC2 over Azure: AWS was chosen due to an already working setup. Azure is equally viable and supported in the Terraform config.

 SSH Reliability: Occasionally, SSH connection fails, but EC2 is successfully provisioned, and the app runs.

 No domain yet: Supabase site URLs are manually set to your AWS public IP (instead of a domain). This requires updating Supabase settings if the IP changes.

 Next.js config: If you're using next.config.ts, ensure typescript is in devDependencies or the Docker build will fail.
 
 Add HTTPS (nginx/Traefik) and automatic TLS.
 
 Add logs/metrics shipping (e.g., Prometheus , Loki, or Docker logs , Log Analytics).
 
 No reverse proxy yet: The app is served directly on port 80 via Docker. Consider adding Caddy or Nginx later for HTTPS.
 
# 5  How to Verify the APP
  # Local build works
  ```bash
  npm run build
  ```
  App runs locally
  ```bash
  curl http://localhost:3000/api/healthz
  ```
  Should return { "status": "ok" }

  Supabase setup is complete
     RLS should be enforced
     supabase/schema.sql has been applied
     env contains valid Supabase keys

 Terraform provisions EC2
  ```bash
  terraform init
  terraform apply -auto-approve \
  -var 'prefix=team-tasks' \
  -var 'ssh_public_key=ssh-rsa AAAA...'
   ```

  # After deploy, verify:
   ```bash
   curl http://<your-ec2-public-ip>/api/healthz  
   Should return { "status": "ok" }
   ```

# 5. GitHub Actions deploys image, SSHes into EC2, updates container
 Final app should be accessible via 
 ```bash
 http://<EC2-IP>
 ```
 # Compliance & Security Considerations

 This project follows best practices that can support compliance with security standards like ISO 27001 or PCI-DSS, including:

 Data security via RLS: Supabase enforces row-level security (RLS) to isolate user data, meeting principles of least privilege.

 Access control: Auth is handled via Supabase’s Magic Link (OTP over email), providing passwordless and auditable login.

 Infrastructure-as-Code: Terraform is used for reproducible cloud environments (AWS), a core principle in ISO 27001 for system integrity.

 CI/CD logging: GitHub Actions logs every build and deployment, supporting audit trails.

 Secrets management: Sensitive credentials (Supabase keys, SSH private key) are stored in GitHub Secrets, not in code.

 While this template doesn’t guarantee full compliance, it can serve as a secure foundation. To meet formal compliance, further controls such as encryption-at- 
 rest, vulnerability scanning, logging/monitoring, disaster recovery, and organizational policies are required.


