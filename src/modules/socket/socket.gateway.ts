import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { OnModuleInit } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleInit
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly authService: AuthService) {}

  users: { [key: string]: string } = {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(socket: Socket): any {}

  async handleConnection(socket: Socket) {
    const authHeader = socket.handshake.headers.authorization;
    const token = authHeader.split(' ')[1];
    console.log(111, token);
    if (authHeader) {
      try {
        const userId = await this.authService.handleVerifyToken(token);
        console.log(333, userId);
        socket.data.userId = userId;
      } catch (error) {
        socket.disconnect();
      }
    } else {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    console.log('disconnect', socket.data?.userId);
  }

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('id:', socket.id);
      console.log('connected test');
    });
  }

  @SubscribeMessage('addMessage')
  onNewMessage(@MessageBody() body: any) {
    console.log(body);
    this.server.emit('onMessage', {
      msg: 'New Message',
      content: body,
    });
  }
}
