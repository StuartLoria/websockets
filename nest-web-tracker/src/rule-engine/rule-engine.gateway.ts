import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { RuleEngineService } from './rule-engine.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    // origin: 'http://localhost:3000',
    origin: true,
    // methods: ['GET', 'POST'],
    // allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class RuleEngineGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log(
      `WebSocket Gateway initialized listening to ${server.engine.clientsCount} clients`,
    );
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  constructor(private ruleEngineService: RuleEngineService) {}

  @SubscribeMessage('triggerRuleEngineRefresh')
  handleRuleEngineRefresh(client: Socket, payload: any): void {
    console.log(
      `New Rule Engine Refresh Message from ${client.id} with payload: ${JSON.stringify(payload)}`,
    );

    const updateProgress = (progress: number): void => {
      this.server.emit('ruleEngineRefreshUpdate', { progress });
    };

    const notifyCompletion = (): void => {
      this.server.emit('ruleEngineRefreshComplete');
    };

    const newRuleEngineRefreshWasStarted =
      this.ruleEngineService.triggerRuleEngineRefresh(
        updateProgress,
        notifyCompletion,
      );

    if (newRuleEngineRefreshWasStarted) {
      this.server.emit('ruleEngineRefreshStarted');
    } else {
      this.server.emit('ruleEngineAlreadyStarted');
    }
  }
}
