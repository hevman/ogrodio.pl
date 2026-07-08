import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { StaffAuthService } from './staff-auth.service';

@Injectable()
export class StaffLocalStrategy extends PassportStrategy(Strategy, 'staff-local') {
  private readonly logger = new Logger(StaffLocalStrategy.name);

  constructor(private readonly staffAuth: StaffAuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    this.logger.log(`Attempting login for email: ${email}`);
    try {
      const user = await this.staffAuth.validateStaff(email, password);
      this.logger.log(`Login successful for email: ${email}`);
      return user;
    } catch (error) {
      this.logger.error(`Login failed for email: ${email}`, error);
      throw error;
    }
  }
}
