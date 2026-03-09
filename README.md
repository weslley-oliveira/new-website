# Weslley Website

Personal portfolio website built with Next.js. The project is a one-page experience that presents an introduction, biography, selected projects, technology icons, and a contact modal connected to a serverless email endpoint.

## Overview

This repository contains a portfolio site focused on showcasing:

- personal presentation and profile
- "About me" storytelling section
- selected project cards
- technology stack highlights
- downloadable CV
- contact form with email delivery

The application uses the Next.js `pages` router and keeps most content directly in the UI components instead of fetching data from an external CMS or database.

## Tech Stack

### Core

- Next.js 12
- React 17
- TypeScript
- ESLint

### Styling

- SCSS
- CSS Modules
- global styles with `styles/globals.scss`

### UI and Interaction

- `react-scroll` for section navigation
- `react-modal` for the contact modal
- `react-draggable` for draggable desktop modal behavior
- `react-toastify` for notifications
- `react-lottie` for scroll animation
- `react-animate-on-scroll` with `animate.css` for entrance effects
- `react-icons` for iconography

### Form and Backend

- `validator` for email validation
- `nodemailer` for sending contact emails through SMTP

## Main Features

- Single-page portfolio homepage assembled in `pages/index.tsx`
- Dedicated sections for `About`, `Projects`, and `Technologies`
- Smooth scrolling navigation menu
- Responsive contact modal with different desktop and mobile behavior
- CV download from `public/weslley-oliveira-cv.pdf`
- API route at `pages/api/sendMail.js` for sending contact form submissions

## Project Structure

```text
.
├── components/        # Reusable UI parts such as Header, Navbar, and Contact
├── hooks/             # Custom React hooks
├── lotties/           # Animation JSON files
├── pages/             # Next.js pages and API routes
├── public/            # Images, favicon, and CV file
├── styles/            # Global styles and CSS Modules
├── next.config.js     # Next.js configuration
└── tsconfig.json      # TypeScript configuration
```

## Important Files

- `pages/index.tsx`: main landing page that composes the full portfolio
- `pages/about.tsx`: biography and social links
- `pages/projects.tsx`: highlighted projects section
- `pages/technologies.tsx`: technology icons section
- `components/Contact/index.tsx`: contact modal and client-side form flow
- `pages/api/sendMail.js`: SMTP email sending endpoint

## Available Scripts

Install dependencies with one package manager only. This repository includes both `package-lock.json` and `yarn.lock`, but using `npm` is recommended for consistency.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website locally.

Other scripts:

```bash
npm run build
npm run start
npm run lint
```

## Environment Variables

Create a `.env.local` file in the project root with:

```env
USER_EMAIL=your-email@example.com
USER_PASS=your-email-password
```

These variables are used by `pages/api/sendMail.js` to authenticate with the SMTP provider. The current API route is configured for Zoho SMTP:

- host: `smtp.zoho.eu`
- port: `465`
- secure: `true`

## Static Assets

The `public/` directory currently stores:

- profile image
- project screenshots
- favicon
- downloadable CV PDF

## Notes

- The project uses the `pages` router, not the newer Next.js `app` router.
- TypeScript is enabled with `strict: true`, while `allowJs` is also enabled to support mixed TypeScript and JavaScript files.
- Most portfolio content is hardcoded in the page components, which makes updates simple but manual.
- `@sendgrid/mail` is installed in `package.json`, but the active email implementation currently uses `nodemailer`.

## Future Improvements

- move project and profile content into a data file or CMS
- add automated tests
- improve SEO metadata and page descriptions
- add an example env file such as `.env.example`
- remove unused dependencies if they are no longer needed