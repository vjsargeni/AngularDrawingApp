import { Injectable } from '@angular/core';
declare const Pusher: any;

@Injectable()
export class PusherService {
  constructor() {
    const pusher = new Pusher("00b943d62037583d5955", {
      cluster: 'eu',
    });
    this.channel = pusher.subscribe('location');
  }
  channel;

  public init() {
    return this.channel;
  }
}