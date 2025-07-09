import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboardData() {
    return this.adminService.getDashboardData();
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('orders/recent')
  async getRecentOrders() {
    return this.adminService.getRecentOrders();
  }

  @Get('users')
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Get('orders')
  async getOrders() {
    return this.adminService.getOrders();
  }

  @Get('products')
  async getProducts() {
    return this.adminService.getProducts();
  }
} 