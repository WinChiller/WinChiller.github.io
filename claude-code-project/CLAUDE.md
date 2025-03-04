# CLAUDE.md - Guidelines for ReviewChess.com

## Build/Test/Lint Commands
- Build: `npm run build`
- Dev: `npm run dev`
- Test: `npm test`
- Lint: `npm run lint`
- Run single test: `npm test -- -t "test name"`
- Type check: `npm run typecheck`

## Code Style Guidelines
- **Formatting**: Use Prettier with default settings
- **Imports**: Group by: 1) React/Next.js, 2) external libraries, 3) internal modules
- **Types**: Use TypeScript with strict mode, prefer interfaces for objects/components
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Error Handling**: Try/catch with user-friendly messages and error logging
- **Components**: Functional components with hooks, prefer composition over inheritance
- **State Management**: React Context for global state, useState for component state
- **Chess Logic**: Use chess.js for move validation, Stockfish for engine analysis

## Project Structure
- `/src`: Source code with feature-based organization
- `/public`: Static assets including chess piece SVGs
- `/components`: Reusable UI components
- `/lib`: Utility functions and API integration