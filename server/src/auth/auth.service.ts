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
    this.logger.log(`Login attempt for email: ${email}`);
    
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      this.logger.warn(`Login failed: User not found for email ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      this.logger.warn(`Login failed: Email not verified for ${email}`);
      throw new UnauthorizedException('Please verify your email before logging in. Check your inbox for the verification link.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    this.logger.log(`Login successful for user: ${email}`);
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
    this.logger.log(`Email verification attempt with token: ${token?.substring(0, 8)}...`);
    
    if (!token) {
      this.logger.warn('Email verification failed: No token provided');
      throw new UnauthorizedException('Verification token is required');
    }

    // First try to find the user with the token
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      this.logger.warn(`Email verification failed: No user found with token ${token?.substring(0, 8)}...`);
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    this.logger.log(`Found user for verification: ${user.email} (ID: ${user.id})`);

    if (user.isEmailVerified) {
      this.logger.log(`User ${user.email} is already verified`);
      return { message: 'Email is already verified. You can log in now.' };
    }

    if (!user.verificationTokenExpires || user.verificationTokenExpires < new Date()) {
      this.logger.warn(`Verification token expired for user ${user.email}`);
      throw new UnauthorizedException('Verification token has expired. Please register again.');
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

      this.logger.log(`Successfully verified email for user: ${updatedUser.email}`);

      // Send welcome email after verification
      try {
        await this.mailService.sendWelcomeEmail(user.email, user.firstName || 'there');
        this.logger.log(`Welcome email sent to ${user.email}`);
      } catch (emailError) {
        this.logger.error(`Failed to send welcome email to ${user.email}:`, emailError);
        // Don't fail the verification if email sending fails
      }

      return { 
        message: 'Email verified successfully! Welcome to WiseStyle. You can now log in.',
        user: {
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          isEmailVerified: updatedUser.isEmailVerified
        }
      };
    } catch (error) {
      this.logger.error(`Error updating user during verification for ${user.email}:`, error);
      throw new UnauthorizedException('Failed to verify email. Please try again.');
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