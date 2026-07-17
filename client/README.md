# LockA Patient Client

Frontend for the LockA patient app: create a health passport, view records, approve/revoke
provider access, and share QR codes. Built with Vite, React, and TypeScript, targeting the
Base (EVM) network. See the [LockA documentation](https://github.com/LockA-Medical-Passport/LockA-Documentation/blob/main/Documentation.md)
for the full system design.

## Getting started

```bash
npm install
cp .env.example .env   # fill in RPC URL, chain ID, API base URL, contract addresses
npm run dev
```

## Scripts

- `npm run dev` — start the Vite dev server.
- `npm run build` — type-check (`tsc -b`) and produce a production build in `dist/`.
- `npm run preview` — serve the production build locally.
- `npm run lint` — lint with [oxlint](https://oxc.rs).
- `npm run test` — run the test suite with Vitest.

## Stack

- [Vite](https://vite.dev/) + React 19 + TypeScript (strict mode)
- [Tailwind CSS v4](https://tailwindcss.com/) for styling
- [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/react) for tests
