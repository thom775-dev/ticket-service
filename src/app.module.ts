import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module'
import { EventsModule } from './events/events.module'
import { TicketsModule } from './tickets/tickets.module'
import { PurchasesModule } from './purchases/purchases.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    EventsModule,
    TicketsModule,
    PurchasesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
