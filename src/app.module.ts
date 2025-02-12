import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from './schedule/schedule.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EntityModule } from './entity/entity.module';
import { GroupModule } from './group/group.module';
import { TemplateModule } from './template/template.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb+srv://${configService.get('DB_USER')}:${configService.get('DB_PASS')}@cluster0.y5igp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule,
    EntityModule,
    GroupModule,
    TemplateModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
