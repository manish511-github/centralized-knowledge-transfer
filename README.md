# Centralized Knowledge Hub

A modern, full-stack knowledge-sharing platform integrating an LLM (Large Language Model) backend for advanced text processing. This platform serves as a centralized hub for employees to share and access knowledge across the company.

## Live Link

[Centralized Knowledge Hub](https://centralized-knowledge-transfer.vercel.app/)

## Tech Stack

### Frontend
- **React.js**

### Backend
- **Next.js** (API routes, Server-Side Rendering)

### Authentication
- **NextAuth.js** (OAuth, email, social logins)

### Database & ORM
- **PostgreSQL** (Relational database)
- **Prisma** (Type-safe ORM for database management)

### LLM Integration
- **Node.js** (LLM processing)
- **Qdrant** (Vector database for embeddings)
- **text-embedding-004** (Embedding model)
- **LLM Model: gemini-1.5-flash** (LLM for text generation)
- **PostgreSQL & Prisma** (LLM metadata storage)

## Running the Project Locally

### Prerequisites
- **Node.js** (v16+)
- **npm/yarn**
- **PostgreSQL**
- **Qdrant account or local instance**

### Setup & Run

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/your-project.git
    cd your-project
    ```

2. Install dependencies:
    ```bash
    npm install --force
    ```

3. Create a `.env` file and configure credentials:
    ```bash
    NODE_ENV="development"
    NEXT_PUBLIC_APP_URL="https://localhost:3000"
    DATABASE_URL="your_database_url"
    NEXTAUTH_SECRET="your_secret_key"
    ```

4. Ensure PostgreSQL is running and update the `DATABASE_URL` accordingly.

5. Run the following Prisma commands:
    ```bash
    npx prisma format
    npx prisma generate
    npx prisma db push
    ```

6. Start the development server:
    ```bash
    npm run dev
    ```

7. Access the app at [http://localhost:3000](http://localhost:3000).

## Deployment

The project is deployed on Vercel for easy access. Follow these steps for deployment:
- Ensure the `.env` variables are configured correctly for production.
- Push your code to your repository, and Vercel will automatically deploy the latest version.

---
Feel free to contribute to this project or report any issues!
