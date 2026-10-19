# Hope Haven Backend Architecture & API Blueprint

> **Platform**: Hope Haven — Centralized Digital Ecosystem for Child Care Institutions (CCIs), Donors & Volunteers.  
> **Environment**: Node.js (ES Modules) + Express + RESTful Architecture.

---

## 1. Directory Tree & Purpose

```text
backend/
├── src/
│   ├── app.js                 # Express application configuration, CORS, parsers & route mounting
│   ├── config/                # Environment variables, DB connectors & third-party keys
│   │   ├── env.js             # Validated environment configuration defaults
│   │   └── db.js              # Centralized database connection logic
│   ├── controllers/           # HTTP request handlers & response formatting
│   │   ├── authController.js        # Register, login, Aadhaar OTP verification & me profile
│   │   ├── orphanageController.js   # Institutional profile & document submission
│   │   ├── requirementController.js # Urgent needs CRUD & prioritized live feed
│   │   ├── donationController.js    # Financial contributions, ledger & 80G tax receipts
│   │   ├── volunteerController.js   # Volunteer roles & application processing
│   │   └── userController.js        # Supporter profile, impact statistics & trophies
│   ├── middlewares/           # Interceptors & security filters
│   │   ├── authMiddleware.js        # JWT Bearer token validator & req.user injector
│   │   ├── roleMiddleware.js        # Role-Based Access Control (RBAC: supporter, orphanage, admin)
│   │   ├── uploadMiddleware.js      # Multer file upload handler (photos & KYC documents)
│   │   └── errorMiddleware.js       # 404 Not Found & global exception handlers
│   ├── models/                # Entity schemas & data models
│   │   ├── User.js                  # Supporter / Rep / Admin credentials & impact
│   │   ├── Orphanage.js             # CCI institution details, PAN, JJ Act & KYC status
│   │   ├── Requirement.js           # Needs (medical, food, education) with urgency weights
│   │   ├── Donation.js              # Payment ledger, receipt IDs & donor anonymity
│   │   ├── VolunteerRole.js         # Orphanage-posted volunteer openings
│   │   └── VolunteerApplication.js  # Supporter shift applications & approval status
│   ├── routes/                # Modular API route endpoints
│   │   ├── index.js                 # Master router aggregation (/api/...)
│   │   ├── authRoutes.js            # /api/auth
│   │   ├── orphanageRoutes.js       # /api/orphanages
│   │   ├── requirementRoutes.js     # /api/requirements
│   │   ├── donationRoutes.js        # /api/donations
│   │   ├── volunteerRoutes.js       # /api/volunteers
│   │   └── userRoutes.js            # /api/users
│   ├── services/              # Core business logic layer
│   │   ├── authService.js           # Password hashing (bcrypt) & JWT token generation
│   │   ├── kycService.js            # Aadhaar Verhoeff validation & OTP lifecycle
│   │   └── feedService.js           # Urgency double-sort algorithm for Supporter feed
│   ├── utils/                 # Utility helpers & algorithms
│   │   ├── apiResponse.js           # Consistent JSON response standard ({ success, message, data })
│   │   ├── verhoeff.js              # Mathematical Verhoeff checksum algorithm
│   │   └── formatters.js            # Currency (INR), Aadhaar & phone masking, receipt ID generator
│   └── validations/           # Input validation rules (Joi/Zod schemas)
├── uploads/                   # Upload storage (gitignored)
│   ├── documents/             # CCI/JJ registration documents & PAN proof
│   └── photos/                # Orphanage building exterior photos
├── tests/                     # Unit and integration test suites
│   └── verhoeff.test.js
├── .env.example               # Environment variables template
├── .gitignore                 # Files excluded from version control
├── package.json               # Backend dependencies & npm scripts
├── server.js                  # Server entry point (starts HTTP server on PORT)
└── README.md                  # This architectural reference guide
```

---

## 2. How the Request Flow Works (MVC / Service-Repository Pattern)

When a request arrives from the frontend (React / Vite):

```
Client (Frontend / React)
         │
         ▼  [HTTP Request with optional JWT Bearer Token]
   server.js ──▶ src/app.js
                   │
                   ▼  [CORS, Body Parsers, Static Uploads]
         src/middlewares/authMiddleware.js (Validates JWT)
         src/middlewares/roleMiddleware.js (Checks 'supporter' vs 'orphanage' role)
                   │
                   ▼  [Matches Route]
             src/routes/ (e.g. requirementRoutes.js)
                   │
                   ▼  [Dispatches to Controller]
       src/controllers/ (e.g. requirementController.js)
                   │
                   ▼  [Delegates Business Logic]
        src/services/ (e.g. feedService.js / kycService.js)
                   │
                   ▼  [Reads / Writes Data]
         src/models/ & Database
                   │
                   ▼  [JSON Response using apiResponse.js]
Client receives: { "success": true, "message": "...", "data": [...] }
```

---

## 3. Core API Endpoints Mapping

| Module | Method | Endpoint | Description | Frontend Consumer |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Register supporter or orphanage rep | `Register.jsx` |
| **Auth** | `POST` | `/api/auth/login` | Role-based login (donor/volunteer or orphanage) | `Login.jsx` |
| **Auth** | `POST` | `/api/auth/aadhaar/send-otp` | Validates Verhoeff checksum & sends 6-digit OTP | `Register.jsx` |
| **Auth** | `POST` | `/api/auth/aadhaar/verify-otp` | Validates entered OTP code | `Register.jsx` |
| **Auth** | `GET` | `/api/auth/me` | Fetch logged-in user session | Protected routes |
| **Orphanages** | `POST` | `/api/orphanages/register` | Multipart upload (building photo + registration PDF) | `Register.jsx` |
| **Orphanages** | `GET` | `/api/orphanages/profile` | Institutional profile & verification status | `ProfileSection.jsx` |
| **Orphanages** | `PUT` | `/api/orphanages/profile` | Update profile contact, address, capacity | `ProfileModal.jsx` |
| **Requirements** | `GET` | `/api/requirements/feed` | Priority-sorted urgency feed (Double-sort algorithm) | `UserDashboard.jsx` |
| **Requirements** | `GET` | `/api/requirements` | Fetch orphanage requirements | `RequirementsSection.jsx` |
| **Requirements** | `POST` | `/api/requirements` | Create a new requirement | `RequirementModal.jsx` |
| **Requirements** | `PUT` | `/api/requirements/:id` | Update requirement progress / status | `RequirementModal.jsx` |
| **Donations** | `POST` | `/api/donations` | Process financial contribution & generate receipt | `UserDashboard.jsx` (Donate Modal) |
| **Donations** | `GET` | `/api/donations` | Fetch donation ledger for orphanage | `DonationsSection.jsx` |
| **Donations** | `GET` | `/api/donations/receipt/:id` | Fetch printable 80G tax receipt | `ReceiptModal.jsx` |
| **Volunteers** | `GET` | `/api/volunteers/roles` | List open volunteer openings | `UserDashboard.jsx` |
| **Volunteers** | `POST` | `/api/volunteers/roles` | Create new volunteer opening | `VolunteerRoleModal.jsx` |
| **Volunteers** | `POST` | `/api/volunteers/applications` | Supporter submits volunteer shift request | `UserDashboard.jsx` (Volunteer Modal) |
| **Volunteers** | `GET` | `/api/volunteers/applications` | Review volunteer applications | `VolunteersSection.jsx` |
| **Volunteers** | `PATCH` | `/api/volunteers/applications/:id/status`| Accept or reject volunteer application | `VolunteersSection.jsx` |
| **Users** | `GET` | `/api/users/impact` | Supporter lives touched, hours & trophy room | `UserDashboard.jsx` |

---

## 4. How to Run the Backend

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file from template
cp .env.example .env

# 4. Start backend in development mode (with hot-reload)
npm run dev

# 5. Run automated test suite
npm run test
```

Server will run on `http://localhost:5000` and communicate seamlessly with the frontend Vite server on `http://localhost:5173`.
