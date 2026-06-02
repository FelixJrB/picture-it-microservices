# Picture It — Microservices

A back-end system of loosely coupled **microservices** for managing images via a REST API with JWT-based access control.

Built for **Assignment B3 (Picture It)** in the course *1DV026 — Web Programming* at Linnaeus University. The **Auth service** and the **Resource service** were implemented from scratch; the **Image service** was provided already deployed.

A client can register, authenticate, and manage images ("resources") in a RESTful way, using JWTs as bearer tokens for access control. There is a single entry point from the consumer's perspective, while the back end consists of multiple independent services. The endpoints can be tested with Postman or curl — no client application is required.

## Architecture

![Overall overview of the architecture](.readme/overall_architecture.png)

_The Image service is provided already deployed; the Auth and Resource services are implemented in this repository._

The flow for handling image requests:

![Flow chart of the application](.readme/flow_chart.png)

0. The client tries to contact the Resource service but gets a `403` response.
1. The client registers an account and logs in, receiving a JWT upon successful login.
2. Using the JWT as a Bearer token, the client can add, update, and delete resources.
3. On a create, update, or delete request, the Resource service calls the Image service to add, delete, or update the corresponding image. The Resource service stores the resource metadata and responds with the created document.
4. The client can fetch the image from the URL provided by the Resource service.

## Repository structure

```
picture-it-microservices/
├── auth-service/          # Authentication & JWT issuing
├── resource-service/      # Image resource management
├── assignment-routes.json # Deployed endpoints for the running services
└── README.md
```

> This is a monorepo. Each service was originally developed in its own repository and was merged in here with its full commit history preserved.

## Services

### Auth service ([`auth-service/`](./auth-service))

Handles user accounts and issues JWTs on successful authentication. The tokens are signed with **RS256** (asymmetric keys) so that the Resource service can validate them locally — using the account information embedded in the token — without contacting the Auth service on every request.

- **Stack:** Node.js, Express 5, Mongoose/MongoDB, `jsonwebtoken`, `bcrypt`
- See [`auth-service/README.md`](./auth-service/README.md) for setup, including how to generate the RS256 key pair.

### Resource service ([`resource-service/`](./resource-service))

A RESTful API that manages the resources in the system (image URLs, titles, descriptions). The actual image bytes are stored by the Image service; the Resource service stores only metadata and the resulting image URL, and orchestrates calls to the Image service on create/update/delete.

- **Stack:** Node.js, Express 5, Mongoose/MongoDB, `jsonwebtoken`
- See [`resource-service/README.md`](./resource-service/README.md) for setup and notes (e.g. the 500 kB payload limit and running a separate MongoDB instance per service).

### Image service (external, provided)

Already deployed and responsible for storing all images. It is **not** part of this repository. Documentation: <https://courselab.lnu.se/picture-it/images/api/v1/docs/>. Key points:

- Image data is sent as a Base64-encoded string.
- Authentication uses an access token.
- It exposes a public interface for serving images; only the image URL is stored in the Resource service.
- Requests must not exceed 500 kB, so only small images can be handled.

## Running locally

Each service is a standalone Node.js application. In each service folder:

```bash
npm install
npm run dev      # development (nodemon)
# or
npm start        # production
```

Both services require their own environment configuration (e.g. MongoDB connection string, JWT keys/secrets) via a `.env` file, and each is intended to run against its **own** MongoDB instance to keep the services loosely coupled and independently deployable. See each service's README for details.

## Tech stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** MongoDB via Mongoose
- **Auth:** JSON Web Tokens (RS256), `bcrypt` for password hashing
- **Architecture:** REST, microservices

## Notes

- The deployed endpoints for the running services are listed in [`assignment-routes.json`](./assignment-routes.json).
- The original assignment instructions and issues were tracked in the course's GitLab.
