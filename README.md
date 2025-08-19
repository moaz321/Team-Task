A production-ready, minimal task app with user authentication
#                                      +----------------------+
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
2. 🧪 Local Development
# Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```
# Set environment variables
cp .env.example .env.local
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
 
 5. How to Verify the APP
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
      terraform init
      terraform apply -auto-approve \
      -var 'prefix=team-tasks' \
      -var 'ssh_public_key=ssh-rsa AAAA...'

    # After deploy, verify:
      curl http://<your-ec2-public-ip>/api/healthz  
     Should return { "status": "ok" }

# 5. GitHub Actions deploys image, SSHes into EC2, updates container
 Final app should be accessible via http://<EC2-IP>


