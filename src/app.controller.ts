import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/Decorators/auth.public';


@Controller("health")
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Public()
    @Get()
    getHealth(): string {
        return this.appService.healthCheck();
    }
}