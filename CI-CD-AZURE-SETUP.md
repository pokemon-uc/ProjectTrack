# ProjectTrack CI/CD and Azure VM setup

These files provide a real ProjectTrack pipeline rather than placeholder deployment messages.

## Included files

Copy these files into the repository without renaming them:

```text
.github/workflows/ci.yml
.github/workflows/security.yml
.github/workflows/deploy-azure-vm.yml
```

## What each workflow does

### `ci.yml`

Runs on pushes and pull requests to `main`:

- Installs backend dependencies with `npm ci`
- Checks every backend JavaScript file with `node --check`
- Parses and validates `backend/docs/openapi.yaml`
- Installs frontend dependencies
- Runs ESLint
- Builds the Vite frontend
- Builds the complete Docker Compose stack
- Starts PostgreSQL, Redis, backend and frontend
- Calls the backend and frontend health endpoints
- Removes only the temporary CI containers and volumes

The `docker compose down -v` command in this workflow is safe because a GitHub runner is temporary. Do not use `-v` against your local ProjectTrack database.

### `security.yml`

Runs on pushes, pull requests, manual dispatches and every Monday:

- GitHub CodeQL JavaScript analysis
- Backend and frontend production dependency audits
- Trivy repository scan
- Trivy scans of both Docker images
- SARIF uploads to the GitHub Security tab

Dependency audits and Trivy scans initially report findings without blocking delivery. CodeQL remains authoritative. Tighten these gates after reviewing the first reports.

### `deploy-azure-vm.yml`

Performs an actual Docker Compose deployment over SSH. It does not pretend to deploy by printing an `echo` message.

Automatic deployment remains disabled until the Azure VM and GitHub configuration are ready. A manual run is also available.

## Why this differs from NestMatchFinder

NestMatchFinder has useful CI and security workflow structure, but its deployment steps only print placeholder messages such as `Deploying to production environment...`. ProjectTrack's deployment workflow runs `docker compose up --build -d`, checks both health endpoints and fails if the deployment is unhealthy.

ProjectTrack does not claim automated tests because automated tests were intentionally deferred. Its CI uses syntax validation, ESLint, production builds, OpenAPI parsing and a complete Docker Compose smoke test.

## Commit the workflow files

From `P:\projecttrack`:

```powershell
New-Item -ItemType Directory -Force .github\workflows
```

Place the three YAML files there, then run:

```powershell
git add .github/workflows
git commit -m "ci: add validation security and Azure deployment workflows"
git push origin main
```

The CI and Security workflows start immediately after the push.

## Azure VM prerequisites

Create an Ubuntu Azure VM for a portfolio deployment. Restrict SSH access to your IP. Install Git, Docker Engine and the Docker Compose plugin on the VM.

Example commands on the VM:

```bash
sudo apt-get update
sudo apt-get install -y git docker.io docker-compose-v2 curl
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

Sign out and reconnect so the Docker group change takes effect.

Prepare the deployment directory:

```bash
sudo mkdir -p /opt/projecttrack
sudo chown "$USER":"$USER" /opt/projecttrack
git clone https://github.com/pokemon-uc/ProjectTrack.git /opt/projecttrack
cd /opt/projecttrack
cp .env.docker.example .env
nano .env
```

Use new production secrets. For an initial VM demo where the frontend and backend ports are exposed directly:

```env
DB_USER=postgres
DB_NAME=projecttrack
DB_PASSWORD=GENERATE_A_NEW_PRODUCTION_DATABASE_PASSWORD
JWT_SECRET=GENERATE_A_NEW_64_BYTE_JWT_SECRET
JWT_EXPIRES_IN=2h
CLIENT_URL=http://VM_PUBLIC_IP:5173,http://VM_PUBLIC_IP:5000
VITE_API_URL=http://VM_PUBLIC_IP:5000/api
```

Never copy local secrets to Azure and never commit the VM `.env` file.

Start the first deployment manually on the VM:

```bash
cd /opt/projecttrack
docker compose up --build -d
docker compose ps
curl --fail http://localhost:5000/api/health
curl --fail http://localhost:5173/health
```

For the initial demo, permit inbound TCP ports `5173` and `5000` in the Azure Network Security Group. Do not expose PostgreSQL `5433` or Redis `6379` publicly. Production hardening should put the application behind HTTPS and remove direct public access to internal service ports.

## GitHub environment and secrets

In the GitHub repository, create an environment named `production` and add:

```text
AZURE_VM_HOST      Public IP address or DNS name
AZURE_VM_USER      Ubuntu VM username
AZURE_VM_SSH_KEY   Complete private SSH key
```

Add a repository variable:

```text
AZURE_DEPLOY_ENABLED=true
```

Leave it absent or set it to `false` until the VM is ready. After enabling it, every successful `main` CI run triggers the Azure deployment. You can also run `Deploy to Azure VM` manually from the Actions tab.

## Repository badges

Add badges only after the workflows have completed successfully:

```markdown
[![CI](https://github.com/pokemon-uc/ProjectTrack/actions/workflows/ci.yml/badge.svg)](https://github.com/pokemon-uc/ProjectTrack/actions/workflows/ci.yml)
[![Security](https://github.com/pokemon-uc/ProjectTrack/actions/workflows/security.yml/badge.svg)](https://github.com/pokemon-uc/ProjectTrack/actions/workflows/security.yml)
```

Do not claim Azure deployment is complete until the deployment workflow has successfully run and a public URL is available.
