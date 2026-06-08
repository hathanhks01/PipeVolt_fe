import * as signalR from '@microsoft/signalr';
import { Url } from '../constants/config';
import JwtUtils from '../constants/JwtUtils';

export const SIGNALR_URL = `${Url.replace(/\/$/, '')}/chathub`;

export function createHubConnection(reconnectDelays = [0, 2000, 5000, 10000]) {
  return new signalR.HubConnectionBuilder()
    .withUrl(SIGNALR_URL, {
      accessTokenFactory: () => JwtUtils.getToken() || '',
      withCredentials: true,
    })
    .withAutomaticReconnect(reconnectDelays)
    .configureLogging(signalR.LogLevel.Warning)
    .withKeepAliveInterval(15000)
    .withServerTimeout(120000)
    .build();
}
