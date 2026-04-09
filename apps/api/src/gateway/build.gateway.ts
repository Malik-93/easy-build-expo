import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: process.env.WEB_URL || 'http://localhost:3001', credentials: true },
  namespace: '/logs',
})
export class BuildGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(BuildGateway.name);

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  /** Client subscribes to a specific build's log stream */
  @SubscribeMessage('subscribe:build')
  handleSubscribe(@MessageBody() data: { buildId: string }, @ConnectedSocket() client: Socket) {
    const room = `build:${data.buildId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    client.emit('subscribed', { buildId: data.buildId });
  }

  @SubscribeMessage('unsubscribe:build')
  handleUnsubscribe(@MessageBody() data: { buildId: string }, @ConnectedSocket() client: Socket) {
    client.leave(`build:${data.buildId}`);
  }

  /** Called by BuildProcessor to broadcast log lines to all subscribers */
  emitLog(buildId: string, line: string) {
    this.server.to(`build:${buildId}`).emit('log:line', { buildId, line, timestamp: new Date().toISOString() });
  }

  /** Emit build status change */
  emitStatusChange(buildId: string, status: string) {
    this.server.to(`build:${buildId}`).emit('build:status', { buildId, status });
  }
}
