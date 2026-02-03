import { Injectable, PipeTransform, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class InjectUserPipe implements PipeTransform {
  constructor(@Inject(REQUEST) private readonly request: any) {}

  transform(value: any) {
    return {
      ...value,
      usuario_id: this.request.user.id,
    };
  }
}
