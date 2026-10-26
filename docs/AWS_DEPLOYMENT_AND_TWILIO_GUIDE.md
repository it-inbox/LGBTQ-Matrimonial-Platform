# Complete AWS Production Deployment & Twilio OTP Architecture Guide

**Platform:** EverPride LGBTQ+ Matrimonial Platform  
**Target Infrastructure:** Amazon Web Services (AWS)  
**SMS Gateway:** Twilio Programmable Messaging  

---

## 1. Executive Architecture Topology

```
                                  ┌───────────────────────────┐
                                  │   Route 53 DNS & ACM      │
                                  │   (Custom Domain + SSL)   │
                                  └─────────────┬─────────────┘
                                                │
                      ┌─────────────────────────┴─────────────────────────┐
                      │                                                   │
                      ▼                                                   ▼
         ┌──────────────────────────┐                        ┌──────────────────────────┐
         │     CloudFront (CDN)     │                        │  Application Load        │
         │  (HTTPS Edge Distribution)│                        │  Balancer (ALB)          │
         └────────────┬─────────────┘                        └────────────┬─────────────┘
                      │                                                   │ (HTTP / WebSocket)
                      ▼                                                   ▼
         ┌──────────────────────────┐                        ┌──────────────────────────┐
         │       Amazon S3          │                        │     AWS ECS Fargate      │
         │ (Static SPA: apps/web)   │                        │  (NestJS 11 + Socket.IO) │
         └──────────────────────────┘                        └────────────┬─────────────┘
                                                                          │
                                                ┌─────────────────────────┴─────────────────────────┐
                                                │                                                   │
                                                ▼                                                   ▼
                                 ┌──────────────────────────────┐                    ┌──────────────────────────────┐
                                 │       Amazon RDS             │                    │     Twilio SMS REST API      │
                                 │     (PostgreSQL 16)          │                    │  (Live OTP Mobile Delivery)  │
                                 └──────────────────────────────┘                    └──────────────────────────────┘
```

---

## 2. Part 1: Actually Sending the OTP via Twilio

### 2.1. Twilio Setup Checklist
1. **Sign Up / Log In**: Create an account on [twilio.com](https://www.twilio.com/).
2. **Obtain a Phone Number**:
   - Go to **Phone Numbers** -> **Manage** -> **Buy a number**.
   - Select an SMS-capable number (e.g. US `+1...` or local jurisdiction).
3. **Retrieve Credentials**:
   - Navigate to the **Twilio Console Dashboard**.
   - Copy:
     - **Account SID**: (e.g. `ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)
     - **Auth Token**: (e.g. `your_auth_token_secret`)
     - **Twilio Phone Number**: (e.g. `+12345678900`)

### 2.2. International & Regulatory Considerations
- **Testing on Trial Accounts**: In a Twilio trial account, you must add the recipient phone number to **Verified Caller IDs** in Twilio Console before sending messages.
- **Upgraded Accounts**: Send to any mobile device worldwide.
- **Indian Numbers (`+91...`)**: Under Telecom Regulatory Authority of India (TRAI) guidelines, commercial SMS requires DLT template registration. If sending to Indian numbers internationally without DLT, use an alphanumeric sender ID or Twilio Messaging Service with international routing enabled.

### 2.3. How the Backend Dispatches the OTP
The codebase in `apps/api/src/modules/auth/sms.service.ts` already has the Twilio integration wired:
```ts
const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64");

const body = new URLSearchParams({
  To: phoneNumber.replace(/\s+/g, ""),
  From: twilioPhoneNumber,
  Body: `Your EverPride verification code is ${otp}. Valid for 5 minutes. Do not share this code.`,
});

const res = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: body.toString(),
});
```

### 2.4. Activating Twilio in Production
Set the environment variables on the ECS Task Definition (or local testing `.env`):
```env
TWILIO_ACCOUNT_SID="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_PHONE_NUMBER="+12345678900"
```
Once these three variables are set, the backend stops printing to the development console simulator and immediately sends real SMS to the user's phone.

---

## 3. Part 2: AWS Infrastructure Provisioning

### Step 1: Managed PostgreSQL Database (Amazon RDS)

1. **Create RDS Instance**:
   - Engine: **PostgreSQL 16**
   - Template: **Free tier** or **Production (Multi-AZ)**
   - DB instance identifier: `everpride-db`
   - Master username: `postgres`
   - Master password: `<SECURE_PASSWORD>`
   - Instance class: `db.t4g.micro` (dev/pilot) or `db.m6g.large` (production)
   - Storage: 20 GB gp3 with autoscaling
2. **Network & Security**:
   - VPC: Default or custom VPC
   - Public Access: *No* (accessible within VPC or via VPN/Bastion)
   - Security Group: Allow inbound port `5432` only from the ECS Security Group
3. **Database URL format**:
   ```
   postgresql://postgres:<SECURE_PASSWORD>@everpride-db.xxxxxx.<region>.rds.amazonaws.com:5432/everpride_matrimonial?sslmode=require
   ```

---

### Step 2: Backend Containerization & AWS ECS Fargate

Because EverPride uses **Socket.IO** for real-time messaging, typing indicators, presence, and instant alerts, the backend requires persistent connections. **AWS ECS Fargate** provides serverless container management with full WebSocket support.

#### 1. Push Docker Image to Amazon ECR
```bash
# Authenticate Docker to AWS ECR
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<region>.amazonaws.com

# Create ECR repository (first time only)
aws ecr create-repository --repository-name everpride-api --region <region>

# Build the pruned production image from root workspace
docker build -t everpride-api -f apps/api/Dockerfile .

# Tag and push image
docker tag everpride-api:latest <aws_account_id>.dkr.ecr.<region>.amazonaws.com/everpride-api:latest
docker push <aws_account_id>.dkr.ecr.<region>.amazonaws.com/everpride-api:latest
```

#### 2. Create Application Load Balancer (ALB)
- Scheme: **Internet-facing**
- Listeners:
  - `HTTP:80` (redirects to `HTTPS:443`)
  - `HTTPS:443` (SSL Certificate from AWS Certificate Manager)
- Target Group:
  - Target type: **IP** (required for Fargate)
  - Protocol: `HTTP`, Port: `4001`
  - Health check path: `/api/v1/profiles/me` or `/api/docs`
  - **Stickiness**: Enable **Application-based cookie stickiness** or **Duration-based stickiness** on the Target Group. This ensures WebSocket connections maintain affinity with the same Fargate task.

#### 3. Define ECS Task Definition (`everpride-api-task.json`)
```json
{
  "family": "everpride-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<account_id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "everpride-api",
      "image": "<aws_account_id>.dkr.ecr.<region>.amazonaws.com/everpride-api:latest",
      "portMappings": [
        {
          "containerPort": 4001,
          "hostPort": 4001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "PORT", "value": "4001" },
        { "name": "CORS_ORIGIN", "value": "https://everpride.app" }
      ],
      "secrets": [
        { "name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:<region>:<account_id>:secret:everpride/DATABASE_URL" },
        { "name": "JWT_ACCESS_SECRET", "valueFrom": "arn:aws:secretsmanager:<region>:<account_id>:secret:everpride/JWT_ACCESS_SECRET" },
        { "name": "JWT_REFRESH_SECRET", "valueFrom": "arn:aws:secretsmanager:<region>:<account_id>:secret:everpride/JWT_REFRESH_SECRET" },
        { "name": "TWILIO_ACCOUNT_SID", "valueFrom": "arn:aws:secretsmanager:<region>:<account_id>:secret:everpride/TWILIO_ACCOUNT_SID" },
        { "name": "TWILIO_AUTH_TOKEN", "valueFrom": "arn:aws:secretsmanager:<region>:<account_id>:secret:everpride/TWILIO_AUTH_TOKEN" },
        { "name": "TWILIO_PHONE_NUMBER", "valueFrom": "arn:aws:secretsmanager:<region>:<account_id>:secret:everpride/TWILIO_PHONE_NUMBER" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/everpride-api",
          "awslogs-region": "<region>",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### 4. Run Initial Database Migrations & Seeds on RDS
Before starting the service, execute the database push from a bastion or CI/CD runner:
```bash
DATABASE_URL="<RDS_CONNECTION_STRING>" pnpm db:push
DATABASE_URL="<RDS_CONNECTION_STRING>" pnpm --filter @everpride/database prisma db seed
```

---

### Step 3: Frontend Web Deployment (Amazon S3 + CloudFront)

The frontend is a single-page application (SPA) built with Vite and React 18.

#### 1. Build Production Assets with Production API URL
```bash
# In apps/web (or root)
VITE_API_URL="https://api.everpride.app/api/v1" pnpm --filter @everpride/web build
```
This generates the optimized production bundle in `apps/web/dist`.

#### 2. Create Amazon S3 Bucket
- Bucket name: `everpride-web-production`
- Block Public Access: **Enabled** (CloudFront will access via Origin Access Control - OAC)
- Static website hosting: Disabled (CloudFront serves the files securely)

#### 3. Upload Production Assets to S3
```bash
aws s3 sync apps/web/dist s3://everpride-web-production/ --delete
```

#### 4. Configure Amazon CloudFront Distribution
- **Origin**: `everpride-web-production.s3.<region>.amazonaws.com`
- **Origin Access**: Use Origin Access Control (OAC) to sign requests
- **Viewer Protocol Policy**: **Redirect HTTP to HTTPS**
- **Allowed HTTP Methods**: `GET, HEAD, OPTIONS`
- **SSL Certificate**: Custom SSL certificate from ACM (e.g. `everpride.app`)
- **SPA Custom Error Response (Critical for React Router)**:
  - HTTP Error Code: `403` and `404`
  - Response Page Path: `/index.html`
  - HTTP Response Code: `200`
  *(This ensures routes like `/discover`, `/matches`, `/profile/edit`, and `/messages` refresh cleanly without 404 errors)*

---

### Step 4: DNS Configuration (Amazon Route 53)

| Record Name | Type | Value | Target |
| :--- | :--- | :--- | :--- |
| `everpride.app` | `A` (Alias) | CloudFront Distribution Domain (`dxxxx.cloudfront.net`) | Web Frontend |
| `www.everpride.app` | `A` (Alias) | CloudFront Distribution Domain | Web Frontend |
| `api.everpride.app` | `A` (Alias) | Application Load Balancer (`everpride-alb-xxxx.amazonaws.com`) | Backend API & WebSockets |

---

## 4. End-to-End Verification Runbook

Once deployed, execute this 5-step verification checklist:

1. **Verify Backend Health & Docs**:
   - Visit `https://api.everpride.app/api/docs`. Verify Swagger loads cleanly with all endpoints.
2. **Verify Live SMS OTP**:
   - Open `https://everpride.app`.
   - Click **Sign In / Verify Phone**.
   - Enter your personal mobile number with country code.
   - Click **Send OTP**.
   - Check your phone. The SMS should arrive within 2–5 seconds from your Twilio sender:
     > *"Your EverPride verification code is 123456. Valid for 5 minutes. Do not share this code."*
3. **Verify Onboarding & Profile**:
   - Enter the received 6-digit code.
   - Verify account is authenticated, JWT stored, and profile loads.
4. **Verify Real-Time WebSocket Connection**:
   - Open `/messages` (Connect).
   - Verify browser console connects to `wss://api.everpride.app/chat` without CORS or upgrade errors.
   - Send a message to an online match; confirm real-time delivery and unread counter badges update instantly.
5. **Verify SPA Routing Refresh**:
   - Navigate to `/profile/edit#marital-status`.
   - Hit browser refresh (`F5`). Verify the page loads cleanly without 404/403 errors and scrolls directly to Marital Status.
