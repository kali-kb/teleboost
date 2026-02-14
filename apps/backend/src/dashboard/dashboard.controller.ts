import { Controller, Get, UnauthorizedException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get()
    async getDashboard(@Session() session: UserSession) {
        if (!session?.user?.id) throw new UnauthorizedException();
        return this.dashboardService.getDashboardData(session.user.id);
    }
}
