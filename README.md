# WiseStyle E-commerce Platform

A modern e-commerce platform built with Next.js, NestJS, PostgreSQL, and Redis.

## Tech Stack

### Frontend

- Next.js
- TailwindCSS
- TypeScript
- Axios

### Backend

- NestJS
- PostgreSQL
- Redis
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js 16+
- Docker and Docker Compose
- PostgreSQL
- Redis

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/wisestyle.git
cd wisestyle
```

2. Install dependencies:

```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

3. Set up environment variables:

```bash
# Copy example env files
cp client/.env.example client/.env
cp server/.env.example server/.env
```

4. Start the development environment:

```bash
# Start databases using Docker
docker-compose up -d

# Start frontend
cd client
npm run dev

# Start backend
cd ../server
npm run start:dev
```

## Features

- User Authentication
- Product Management
- Shopping Cart
- Order Processing
- Admin Dashboard
- Real-time Updates

## Deployment

- Frontend: Vercel
- Backend: Railway
- Database: Railway PostgreSQL
- Cache: Railway Redis

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
