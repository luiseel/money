# With-NestJs | API

## Getting Started

First, run the development server:

```bash
pnpm run dev
```

By default, your server will run at [http://localhost:3000](http://localhost:3000). You can use your favorite API platform like [Insomnia](https://insomnia.rest/) or [Postman](https://www.postman.com/) to test your APIs

You can start editing the demo **APIs** by modifying [linksService](./src/links/links.service.ts) provider.

### ⚠️ Note about build

If you plan to only build this app. Please make sure you've built the packages first.

## Learn More

To learn more about NestJs, take a look at the following resources:

- [Official Documentation](https://docs.nestjs.com) - A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- [Official NestJS Courses](https://courses.nestjs.com) - Learn everything you need to master NestJS and tackle modern backend applications at any scale.
- [GitHub Repo](https://github.com/nestjs/nest)

## Authentication with Clerk

This API uses Clerk for authentication. To protect endpoints and access user information, follow these steps:

### 1. Configure Environment Variables

You'll need to set up your Clerk secret key. Copy the `apps/api/.env.example` file to `apps/api/.env` and fill in your Clerk secret key:

```bash
cp apps/api/.env.example apps/api/.env
```

Then, edit `apps/api/.env`:

```env
# Clerk Configuration
CLERK_SECRET_KEY=your_clerk_secret_key_from_clerk_dashboard
# CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here (Uncomment if needed)
```

### 2. Protecting Routes

To protect an endpoint, use the `@Auth()` decorator which was created in `apps/api/src/common/decorators/auth.decorator.ts`:

```typescript
import { Controller, Get, Req } from '@nestjs/common';
import { Auth } from '../common/decorators'; // Or use: from 'src/common/decorators';
import { Request } from '@nestjs/common';

@Controller('some-resource')
export class SomeResourceController {
  @Get('protected')
  @Auth()
  getProtectedResource(@Req() req: Request) {
    const { userId, claims } = req.auth as any; // Access Clerk auth object
    console.log('User ID:', userId);
    // Your logic here
    return { message: 'This is a protected resource', userId };
  }
}
```

### 3. Accessing User Information

Within a route protected by `@Auth()`, user information is available on the `req.auth` object. This object is populated by the Clerk NestJS SDK and contains details like `userId`, `sessionId`, and any custom `claims` associated with the user's session.

```typescript
// Inside a method decorated with @Auth() in your controller:
// Ensure Request is imported from '@nestjs/common' and injected with @Req()
async yourProtectedMethod(@Req() req: Request) {
  const authData = req.auth as any; // Cast to any or a more specific Clerk AuthObject type if known

  const userId = authData.userId; // The ID of the authenticated user
  const sessionId = authData.sessionId; // The ID of the current session
  const claims = authData.claims; // Session claims, including custom claims from your Clerk JWT template

  console.log(`User ID: ${userId}`);
  console.log(`Session ID: ${sessionId}`);
  console.log('Session Claims:', claims);

  // Use userId, sessionId, or claims for your application logic,
  // such as fetching user-specific data or performing role-based access control.
}
```
The `req.auth` object structure is determined by the Clerk SDK. Refer to the official Clerk documentation for the most accurate and detailed information on the `AuthObject` structure.
