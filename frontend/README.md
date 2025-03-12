# Text Summarization Frontend

A modern web application for text summarization using HuggingFace models. This frontend interfaces with the Text Summarization API to provide a user-friendly experience for creating and managing chat-based text summaries.

## Features

- **User Authentication**: Register, login, and manage your profile
- **Chat Sessions**: Create and manage multiple summary sessions
- **Text Summarization**: Generate summaries of long texts using HuggingFace models
- **Meta-Summarization**: Generate summaries of all summaries in a session
- **Responsive Design**: Works on mobile, tablet, and desktop devices

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Library**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios with custom hooks for API integration
- **Authentication**: HTTP-only cookies with JWT

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app`: Next.js pages and layouts
  - `(auth)`: Authentication pages (login, register)
  - `dashboard`: Session management and summarization interface
  - `profile`: User profile management
- `src/components`: Reusable UI components
- `src/contexts`: React context providers for state management
- `src/hooks`: Custom React hooks for API integration
- `src/lib`: Utility functions and API client

## Environment Setup

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

## Learn More

- Check out the main project README for information about the complete system
- See the backend README for API documentation and integration details
