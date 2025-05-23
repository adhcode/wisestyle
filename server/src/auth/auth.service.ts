import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, password: string) {
    this.logger.debug(`Validating user with email: ${email}`);
    
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    this.logger.debug(`Found user: ${JSON.stringify(user)}`);

    if (!user) {
      this.logger.debug('User not found');
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      this.logger.debug('Email not verified');
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    this.logger.debug(`Password valid: ${isPasswordValid}`);

    if (!isPasswordValid) {
      this.logger.debug('Invalid password');
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }


  async login(user: any) {
    try {
      const payload = { email: user.email, sub: user.id, role: user.role };
      const token = this.jwtService.sign(payload);
  
      try {
        await this.redisService.set(`session:${user.id}`, JSON.stringify({
          id: user.id,
          email: user.email,
          role: user.role,
          token,
        }));
      } catch (error) {
        this.logger.warn('Failed to cache user session in Redis:', error);
      }
  
      // Remove password before returning
      const { password, ...userWithoutPassword } = user;
  
      return {
        ...userWithoutPassword,
        access_token: token,
      };
    } catch (error) {
      this.logger.error('Error during login:', error);
      throw new UnauthorizedException('Failed to login');
    }
  }
  
  async register({
    email,
    password,
    firstName,
    lastName,
  }: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new UnauthorizedException('Email already in use');
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        verificationToken,
        verificationTokenExpires,
      },
    });

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await this.mailService.sendVerificationEmail(user.email, verificationLink);

    return { message: 'Registration successful. Please check your email to verify your account.' };
  }

  async verifyEmail(token: string) {
    this.logger.debug(`Verifying email with token: ${token}`);
    
    if (!token) {
      this.logger.debug('No token provided');
      throw new UnauthorizedException('Verification token is required');
    }

    // First try to find the user with the token
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    this.logger.debug(`Found user for verification: ${JSON.stringify(user)}`);

    if (!user) {
      this.logger.debug('No user found with this verification token');
      throw new UnauthorizedException('Invalid verification token');
    }

    if (!user.verificationTokenExpires || user.verificationTokenExpires < new Date()) {
      this.logger.debug('Verification token has expired');
      throw new UnauthorizedException('Verification token has expired');
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          verificationToken: null,
          verificationTokenExpires: null,
        },
      });

      this.logger.debug(`Updated user after verification: ${JSON.stringify(updatedUser)}`);

      // Send welcome email after verification
      await this.mailService.sendWelcomeEmail(user.email, user.firstName || 'there');

      return { message: 'Email verified successfully. You can now log in.' };
    } catch (error) {
      this.logger.error('Error updating user during verification:', error);
      throw new UnauthorizedException('Failed to verify email');
    }
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async logout(userId: string) {
    try {
      await this.redisService.del(`session:${userId}`);
      return { message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error('Error during logout:', error);
      throw new UnauthorizedException('Failed to logout');
    }
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException();
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
} 