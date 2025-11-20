# Blockchain Video Verification System

## Overview

This is a blockchain-based video verification system that ensures video authenticity through cryptographic methods. The application allows users to verify that video recordings haven't been tampered with by checking frame hashes, chain continuity, cryptographic signatures, and sensor fingerprints. It features a modern web interface built with React and a Node.js backend that implements blockchain verification logic.

The system maintains a blockchain where each block represents a video chunk with its associated metadata, creating an immutable chain of evidence that can detect any tampering attempts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query for server state management and caching
- Shadcn UI components built on Radix UI primitives
- Tailwind CSS for styling with custom blockchain-themed design system

**Design System:**
- Dark mode-first interface with black background (#000000)
- Custom color palette: Royal Blue (#4169E1) for primary actions, Neon Green (#39FF14) for success states, Red (#FF0000) for errors
- Typography: Inter/Space Grotesk for headings, JetBrains Mono for technical data
- Component library based on Shadcn UI with extensive customization for blockchain aesthetics

**Key Pages:**
- Home: Hero section with animated blockchain visualization, feature explanations
- Verify: Upload interface for video files and metadata JSON, displays verification results
- Blockchain: Explorer view showing all blocks in the verification chain
- Admin: Device registration and manual block addition interface

**State Management:**
- TanStack Query handles all server data fetching, caching, and mutations
- React hooks for local component state
- No global state management library needed due to query-based architecture

### Backend Architecture

**Technology Stack:**
- Node.js with Express framework
- TypeScript for type safety across the stack
- File-based storage using JSON files (devices.json, blockchain.json)
- Multer for handling multipart/form-data file uploads

**Core Verification Logic:**
The system implements blockchain verification through several cryptographic checks:

1. **Hash Integrity**: SHA-256 hashing of video chunks to create immutable fingerprints
2. **Chain Continuity**: Each block references the previous block's hash, ensuring the chain hasn't been broken
3. **Signature Validity**: Ed25519 signatures using TweetNaCl to verify device authenticity
4. **Sensor Fingerprint**: Device-specific fingerprints to prevent recording forgery

**API Endpoints:**
- `POST /api/registerDevice` - Register new recording devices with public keys
- `POST /api/addBlock` - Add new blocks to the blockchain
- `POST /api/verify` - Verify video authenticity against metadata
- `GET /api/blockchain` - Retrieve the entire blockchain
- `GET /api/device/:id` - Get device information

**Storage Strategy:**
The application uses a hybrid storage approach:
- In-memory storage (Map/Array) for fast runtime access
- Persistent JSON file storage for data durability
- Data is loaded from disk on startup and saved on every mutation
- Located in `/data` directory with separate files for devices and blockchain

This approach was chosen over a database for simplicity and portability, making it easy to deploy without database setup. The code is structured to allow easy migration to PostgreSQL using Drizzle ORM (schema already defined in `shared/schema.ts`).

### Data Models

**Device Schema:**
- `deviceId`: Unique identifier for the recording device
- `publicKey`: Ed25519 public key for signature verification
- `registeredAt`: Timestamp of device registration

**Block Schema:**
- `index`: Sequential block number in the chain
- `chunkHash`: SHA-256 hash of the video chunk
- `sensorFingerprint`: Device sensor data fingerprint
- `prevHash`: Hash of the previous block (creates the chain)
- `timestamp`: ISO 8601 timestamp of block creation
- `signature`: Ed25519 signature of the block data
- `deviceId`: Reference to the recording device

**Verification Result:**
- `frameHashMatch`: Boolean indicating if video hash matches metadata
- `chainContinuity`: Boolean indicating if blockchain is intact
- `signatureValidity`: Boolean indicating if signatures are valid
- `sensorFingerprintValidity`: Boolean for fingerprint validation
- `overallValid`: Boolean for complete verification status
- Additional detail fields for debugging

### Build and Deployment

**Development:**
- `npm run dev` starts both Vite dev server and Express backend
- Hot module replacement for frontend changes
- TypeScript compilation without emit (type checking only)

**Production Build:**
- Frontend: Vite builds React app to `dist/public`
- Backend: esbuild bundles Express server to `dist/index.js`
- Single `npm start` command runs the production server
- Express serves static frontend files in production

**Configuration:**
- Path aliases configured for clean imports (`@/`, `@shared/`, `@assets/`)
- Tailwind configured with custom blockchain color variables
- PostCSS with Tailwind and Autoprefixer

## External Dependencies

### UI Component Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives (accordion, dialog, dropdown, popover, toast, etc.)
- **Shadcn UI**: Pre-styled components built on Radix UI following the "New York" style variant
- **Lucide React**: Icon library for consistent iconography

### Cryptography
- **TweetNaCl**: Ed25519 signature verification for device authentication
- **Node.js Crypto**: SHA-256 hashing for content integrity

### File Handling
- **Multer**: Multipart form data parsing for video file uploads (100MB limit)

### Styling and Utilities
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **class-variance-authority**: Type-safe component variants
- **clsx & tailwind-merge**: Conditional className composition

### Form Management
- **React Hook Form**: Form state management
- **Hookform Resolvers**: Zod integration for form validation
- **Zod**: Schema validation and TypeScript type inference

### Data Fetching
- **TanStack Query**: Server state management with caching, refetching, and optimistic updates

### Development Tools
- **Vite**: Fast build tool with HMR
- **esbuild**: JavaScript/TypeScript bundler for production backend
- **TypeScript**: Static type checking across the entire stack
- **Drizzle Kit**: Database schema management (configured for future PostgreSQL migration)

### Potential Database Integration
The application is structured to support PostgreSQL through:
- Drizzle ORM with schema definitions in `shared/schema.ts`
- Neon Serverless driver for PostgreSQL connectivity
- Migration files would be generated to `./migrations`
- Environment variable `DATABASE_URL` would configure the connection

Currently using file-based storage but can migrate to PostgreSQL by implementing the database storage adapter while maintaining the same interface.