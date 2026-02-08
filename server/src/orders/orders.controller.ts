import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { UserRole } from '../entities/user.entity'
import { OrdersService } from './orders.service'

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll() {
    return this.ordersService.findAll()
  }

  @Get('new-for-seller')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER_FULL, UserRole.SELLER_SIMPLE)
  async findNewForSeller() {
    return this.ordersService.findNewForSeller()
  }

  @Get('my-deliveries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COURIER)
  async findMyDeliveries(@Req() req: { user: { id: string } }) {
    return this.ordersService.findForCourier(req.user.id)
  }

  @Get('disputes')
  async findDisputes() {
    return this.ordersService.findWithDisputes()
  }

  @Get(':id/tracks')
  @UseGuards(JwtAuthGuard)
  async getTracks(@Param('id') id: string, @Req() req: { user: { id: string; role: string } }) {
    return this.ordersService.getTracksForOrder(id, req.user.id, req.user.role)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER)
  async create(@Req() req: { user: { id: string } }, @Body() body: { total: number; status: string; items: string }) {
    return this.ordersService.create({
      total: body.total,
      status: body.status ?? 'Новый',
      items: body.items,
      userId: req.user.id,
    })
  }

  @Patch(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER_FULL, UserRole.SELLER_SIMPLE)
  async confirmBySeller(@Param('id') id: string) {
    return this.ordersService.confirmBySeller(id)
  }

  @Patch(':id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async assignCourier(@Param('id') id: string, @Body() body: { courierId: string }) {
    return this.ordersService.assignCourier(id, body.courierId)
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COURIER)
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.ordersService.updateStatus(id, body.status)
  }

  @Patch(':id/dispute')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUYER)
  async openDispute(
    @Param('id') id: string,
    @Body() body: { reason: string; comment?: string }
  ) {
    await this.ordersService.openDispute(id, body.reason, body.comment)
    return { ok: true }
  }

  @Patch(':id/dispute/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async resolveDispute(
    @Param('id') id: string,
    @Body() body: { resolution: string; resolvedBy: string }
  ) {
    await this.ordersService.resolveDispute(id, body.resolution, body.resolvedBy)
    return { ok: true }
  }
}
