import { Injectable } from '@angular/core';
import { env } from 'process';
declare const Pusher: any;

@Injectable()
export class PusherService {
  constructor() {
    const pusher = new Pusher('00b943d62037583d5955', {
      cluster: 'us2'
    });
    this.channel = pusher.subscribe('painting');
  }
  channel;
  public init() {
    return this.channel;
  }
}
