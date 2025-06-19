import {
  Controller,
  Post,
  Body,
  UsePipes,
  BadRequestException,
  Headers,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { clerkWebhookSchema, transformClerkUserToDto } from './schema/user';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import type { UserJSON } from '@clerk/backend';

interface WebhookEvent {
  data: UserJSON;
  object: string;
  type: string;
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(clerkWebhookSchema))
  async handleWebhook(
    @Body() payload: WebhookEvent,
  ) {
    try {
      // Handle different event types
      switch (payload.type) {
        case 'user.created':
        case 'user.updated':
          const userData = transformClerkUserToDto(payload.data);
          return this.usersService.createOrUpdateUser(userData);

        case 'user.deleted':
          return this.usersService.deleteUser(payload.data.id);

        default:
          // Ignore other event types
          return { status: 'ignored', event: payload.type };
      }
    } catch (error) {
      // Handle error with proper type checking
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Invalid webhook: ${errorMessage}`);
    }
  }
}
