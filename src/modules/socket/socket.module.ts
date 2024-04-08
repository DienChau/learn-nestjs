import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { AuthService } from '../auth/auth.service';
import { ChatGateway } from './socket.gateway';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../user/schemas/user.schema';
import { UserModule } from '../user/user.module';
import { UserRepository } from '../user/user.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get('JWT_ACCESS_SECRET'),
          signOptions: {
            expiresIn: config.get<string | number>('JWT_ACCESS_EXPIRES'),
          },
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    UserModule,
  ],
  providers: [
    SocketService,
    AuthService,
    ChatGateway,
    UserService,
    UserRepository,
  ],
})
export class SocketModule {}
