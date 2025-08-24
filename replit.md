# Contact Normalizer SaaS Application

## Overview

This is a contact normalization SaaS application built with a modern full-stack architecture. The application allows users to upload contact files (CSV/Excel), normalize contact data according to configurable rules, and export the cleaned results. It's designed to help businesses standardize their contact databases by formatting phone numbers, names, and other contact information according to specific patterns and preferences.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built using React 18 with TypeScript, following a component-based architecture:

- **UI Framework**: React with Vite for fast development and building
- **Styling**: Tailwind CSS with a custom design system featuring professional SaaS blue/green color palette
- **Component Library**: Radix UI primitives with shadcn/ui components for consistent, accessible UI elements
- **State Management**: React Query (@tanstack/react-query) for server state management
- **Routing**: React Router for client-side navigation
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **File Processing**: Papa Parse for CSV parsing and SheetJS (xlsx) for Excel file handling

### Backend Architecture
The server follows an Express.js REST API pattern:

- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: Hot reload with tsx for development server
- **Build System**: Vite for client bundling and esbuild for server bundling
- **Storage Interface**: Abstracted storage pattern with in-memory implementation (MemStorage)
- **Middleware**: Custom logging, JSON parsing, and error handling

### Data Storage Solutions
Currently implements an in-memory storage pattern but is architected for easy database integration:

- **Schema Definition**: Drizzle ORM with PostgreSQL schema definitions
- **Database Ready**: Pre-configured for PostgreSQL with Neon Database serverless driver
- **Type Safety**: Full TypeScript integration with Drizzle for type-safe database operations
- **Migrations**: Drizzle Kit for database schema migrations

### Core Features Architecture

#### Contact Processing Pipeline
- **File Upload**: Multi-format support (CSV, XLSX, XLS) with validation
- **Contact Parsing**: Google Contacts format compatibility with comprehensive field mapping
- **Normalization Engine**: Configurable rules for phone formatting, name casing, and field consolidation
- **Export System**: CSV export with proper formatting for Google Contacts re-import

#### Normalization Rules Engine
- **Phone Formatting**: Multiple Brazilian phone number formats with regex-based transformation
- **Text Processing**: Accent removal, case transformation (upper, lower, capitalize)
- **Field Management**: Selective inclusion/exclusion of contact fields
- **Data Consolidation**: Smart merging of duplicate or related contact information

#### User Interface Design
- **Tabbed Interface**: Separate sections for upload, configuration, processing, and export
- **Real-time Preview**: Live table display of contacts before and after normalization
- **Progress Feedback**: Loading states and toast notifications for user feedback
- **Responsive Design**: Mobile-first approach with proper breakpoints

### Authentication and Authorization
Currently designed for single-user operation but architected for multi-tenancy:

- **User Schema**: Pre-defined user table structure with username/password fields
- **Session Ready**: Configured for connect-pg-simple session storage
- **Extensible**: Easy integration with OAuth providers or custom authentication

### Development Architecture
- **Monorepo Structure**: Shared schemas and utilities between client and server
- **Type Safety**: End-to-end TypeScript with strict configuration
- **Hot Reload**: Development server with automatic refresh
- **Path Aliases**: Clean import paths with @ and @shared aliases
- **Code Quality**: ESLint and TypeScript strict mode for consistency

## External Dependencies

### Database and Storage
- **Neon Database**: Serverless PostgreSQL for production deployment
- **Drizzle ORM**: Type-safe database operations and schema management
- **connect-pg-simple**: PostgreSQL session storage for user sessions

### File Processing
- **Papa Parse**: Robust CSV parsing with error handling and encoding detection
- **SheetJS (xlsx)**: Excel file reading and writing capabilities
- **File validation**: Client-side file type and size validation

### UI and Styling
- **Radix UI**: Accessible primitive components for complex UI patterns
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Comprehensive icon library with consistent styling
- **Class Variance Authority**: Type-safe component variant management

### Development Tools
- **Vite**: Fast build tool with HMR and optimized production builds
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast JavaScript bundler for server-side code
- **Replit Integration**: Development environment optimizations for Replit platform

### Utility Libraries
- **date-fns**: Date manipulation and formatting utilities
- **clsx & twMerge**: Conditional class name management
- **nanoid**: Unique ID generation for session management
- **zod**: Runtime type validation and schema definition

### React Ecosystem
- **React Query**: Server state management with caching and synchronization
- **React Hook Form**: Performant form handling with minimal re-renders
- **React Router**: Client-side routing with proper TypeScript integration
- **Embla Carousel**: Touch-friendly carousel components for mobile UX