import { Module } from '@nestjs/common';
import { UpstashService } from './upstash.service';

@Module({
  providers: [UpstashService],
  exports: [UpstashService],
})
export class UpstashModule {}