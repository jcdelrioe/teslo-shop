import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { MessageWsService } from './message-ws.service'
import { Server, Socket } from 'socket.io'
import { NewMessageDto } from './dtos/new-message.dto'
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from '../auth/interfaces'

@WebSocketGateway({ cors: true })
export class MessageWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server
  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly jwtService: JwtService,
  ) {}
  handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string

    let payload: JwtPayload

    try {
      payload = this.jwtService.verify(token)
    } catch (error) {
      client.disconnect()
      return
    }
    console.log({ payload })

    // console.log('Cliente conectado: ', client.id)
    this.messageWsService.registerClient(client)

    this.wss.emit(
      'clients-updated',
      this.messageWsService.getConnectedClients(),
    )
  }
  handleDisconnect(client: Socket) {
    // console.log('Cliente desconectado: ', client.id)
    this.messageWsService.removeClient(client.id)
    this.wss.emit(
      'clients-updated',
      this.messageWsService.getConnectedClients(),
    )
  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto) {
    //!Emite unicamente al cliente, no a todos
    // client.emit('message-from-server', {
    //   fullName: 'Soy Yo JCDRE!!!',
    //   message: payload.message || 'no-message',
    // })
    //!Emite a todos menos al cliente
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy Yo JCDRE!!!',
    //   message: payload.message || 'no-message',
    // })
    //!Emite a todos
    this.wss.emit('message-from-server', {
      fullName: 'Soy Yo!!!',
      message: payload.message || 'no-message',
    })
  }
}
