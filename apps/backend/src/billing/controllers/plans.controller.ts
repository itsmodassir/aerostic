import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { PlansService } from '../plans.service';
import { Plan } from '../entities/plan.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';

@Controller('admin/plans')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class PlansController {
    constructor(private readonly plansService: PlansService) { }

    @Get()
    findAll() {
        return this.plansService.findAll();
    }

    @Post()
    create(@Body() createPlanDto: Partial<Plan>) {
        return this.plansService.create(createPlanDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePlanDto: Partial<Plan>) {
        return this.plansService.update(id, updatePlanDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.plansService.remove(id);
    }
}
