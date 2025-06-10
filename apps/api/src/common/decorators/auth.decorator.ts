import { applyDecorators, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '@clerk/clerk-sdk-node/nest';

export function Auth() {
  return applyDecorators(
    UseGuards(ClerkAuthGuard)
  );
}
