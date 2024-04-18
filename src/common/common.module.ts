import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { HttpExceptionFilter } from './handle-exceptions';
import { CommonService } from './services';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    CommonService,
  ],
  exports: [CommonService],
})
export class CommonModule {}
