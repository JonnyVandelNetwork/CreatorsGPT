# CreatorsGPT

AI-powered SaaS platform for generating lip-sync videos.

## Overview

CreatorsGPT is a platform that allows users to generate lip-sync videos using AI technology. Users can select an avatar, choose a voice, and enter text to generate a video where the avatar speaks the text with synchronized lip movements.

## Features

- User authentication (signup, login, profile management)
- Avatar selection with multiple options
- Voice selection for each avatar
- Text-to-speech conversion
- AI-powered lip-sync video generation
- Video management (create, view, list)
- Real-time video generation status updates

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Deployment**: Docker, Kubernetes (optional)

## Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- PostgreSQL database

## Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/CreatorsGPT.git
   cd CreatorsGPT
   ```

2. Install dependencies:
   ```bash
   npm run setup
   ```

3. Create a `.env` file in the `apps/backend` directory:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/creatorsgpt"
   JWT_SECRET="your-jwt-secret-key"
   JWT_EXPIRES_IN="1d"
   PORT=3001
   NODE_ENV="development"
   FRONTEND_URL="http://localhost:3000"
   ```

4. Create a `.env.local` file in the `apps/frontend` directory:
   ```
   NEXT_PUBLIC_API_URL="http://localhost:3001/api"
   ```

5. Initialize the database:
   ```bash
   cd apps/backend
   npx prisma migrate dev --name init
   ```

## Running the Application

### Development Mode

To run both frontend and backend in development mode:

```bash
npm run dev:all
```

To run only the frontend:

```bash
npm run dev:frontend
```

To run only the backend:

```bash
npm run dev:backend
```

### Production Mode

Build the application:

```bash
npm run build
```

Start the application:

```bash
npm run start
```

## API Documentation

Once the backend is running, you can access the Swagger API documentation at:

```
http://localhost:3001/api/docs
```

## Project Structure

```
CreatorsGPT/
├── apps/
│   ├── frontend/         # Next.js frontend application
│   └── backend/          # NestJS backend application
├── packages/             # Shared packages
│   └── shared-types/     # Shared TypeScript types
├── package.json          # Root package.json for monorepo setup
└── turbo.json            # Turborepo configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [NestJS](https://nestjs.com/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
