import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import { ZodError, ZodSchema } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      const errors = error instanceof ZodError ? error.errors : [];
      const errorMessages = errors.map((error) => error.message).join(", ");
      throw new BadRequestException("Validation failed", {
        cause: error,
        description: errorMessages,
      });
    }
  }
}
