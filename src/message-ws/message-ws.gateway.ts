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

@WebSocketGateway({ cors: true })
export class MessageWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server
  constructor(private readonly messageWsService: MessageWsService) {}
  handleConnection(client: Socket) {
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
    console.log(client.id, payload)
  }
}
