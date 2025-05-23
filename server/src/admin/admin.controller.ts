import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboardData() {
    return this.adminService.getDashboardData();
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