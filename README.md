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
- **Auth**: Supabase Magic Link (Email OTP).
- **Tasks CRUD**: `id`, `title`, `status` (`todo` | `doing` | `done`), and `owner`.
- **RLS**: Users can only access their own rows via Supabase Row-Level Security.
- **Healthcheck**: `/api/healthz` endpoint for Docker and uptime monitoring.
- **Infra**: Provisioned via Terraform on AWS (minimal EC2 VM with public IP).
- **CI/CD**: GitHub Actions builds the Docker image to GHCR and deploys via Terraform on AWS.
# Supabase Setup
- Create a new project at [Supabase](https://supabase.com).
- Open the **SQL Editor**, then run:
  - `supabase/schema.sql` → sets up the tasks table and RLS policies.
- _(Optional)_ Run `supabase/seed.sql` to insert test data.
  - Replace the `owner` UUID with a real user ID from Supabase Auth.
- In **Authentication > URL Configuration**:
  - Set the **Site URL** to your development URL (e.g. `http://localhost:3000`).
  - Set the **Production URL** to your EC2 public IP (or domain if you have one).
- Create the following environment variables for local development and GitHub Actions:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - _(Optional for server-side)_ `SUPABASE_URL`, `SUPABASE_ANON_KEY`
  Note: Only the anon key is used client-side — RLS is in place to ensure data access is properly restricted per 
 user.

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

 # Terraform provisions EC2
 Open your terminal and run:
 ```bash
 aws configure
 ```
 Enter your aws key and must have aws key.pem file located in terraform dir
  ```bash
 AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
  ```
 Run the following Terraform commands:
 ```bash
 terraform init
 terraform plan       
 terraform apply
 ```

  # After deploy note the public ip, verify:
   ```bash
   curl http://<your-ec2-public-ip:3000>/api/healthz  
   ```

# 5. GitHub Actions deploys image, SSH into EC2, updates container
 First have secrets in github repo
 ```bash
 AWS_ACCESS_KEY_ID
 AWS_REGION
 AWS_SECRET_ACCESS_KEY
 NEXT_PUBLIC_SUPABASE_ANON_KEY
 NEXT_PUBLIC_SUPABASE_URL
 VM_SSH_KEY (.pem file paste all contents including --start-- and --end--)
 VM_USER (in case of ubuntu username is ubuntu)
 ```
 
 Final app should be accessible via 
 ```bash
 http://<EC2-IP:3000>
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


