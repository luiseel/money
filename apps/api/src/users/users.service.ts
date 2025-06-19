import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './schema/user';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByClerkId(clerkUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      throw new NotFoundException(`User with Clerk ID ${clerkUserId} not found`);
    }

    return user;
  }

  async createOrUpdateUser(userData: UserDto) {
    try {
      // Try to find if the user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { clerkUserId: userData.clerkUserId },
      });

      if (existingUser) {
        // Update existing user
        return this.prisma.user.update({
          where: { clerkUserId: userData.clerkUserId },
          data: {
            name: userData.name,
            email: userData.email,
          },
        });
      } else {
        // Create new user
        return this.prisma.user.create({
          data: {
            clerkUserId: userData.clerkUserId,
            name: userData.name,
            email: userData.email,
          },
        });
      }
    } catch (error) {
      // Handle Prisma unique constraint error
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
        throw new ConflictException(`User with Clerk ID ${userData.clerkUserId} already exists`);
      }
      throw error;
    }
  }

  async deleteUser(clerkUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      throw new NotFoundException(`User with Clerk ID ${clerkUserId} not found`);
    }

    // Soft delete by setting the deleted flag to true
    return this.prisma.user.update({
      where: { clerkUserId },
      data: { deleted: true },
    });
  }
}
