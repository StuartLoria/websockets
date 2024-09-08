import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EvaluationService } from './evaluation.service';

@WebSocketGateway()
export class EvaluationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private clients: Set<Socket> = new Set();

  constructor(private readonly evaluationService: EvaluationService) {}

  handleConnection(client: Socket) {
    this.clients.add(client);
    client.emit('initialStatus', this.evaluationService.getStatus());
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client);
  }

  async startEvaluation(collection: any[]) {
    await this.evaluationService.evaluateCollection(
      collection,
      (id, status) => {
        this.server.emit('update', { id, status });
      },
    );
  }

  @SubscribeMessage('evaluate')
  async handleMessage(@MessageBody() data: any): Promise<string> {
    return await this.evaluationService.evaluateElement(data);
  }
}
