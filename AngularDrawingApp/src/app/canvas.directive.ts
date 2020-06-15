import {
  Directive,
  ElementRef,
  HostListener,
  HostBinding,
  AfterViewInit,
} from '@angular/core';
import { v4 } from 'uuid';
import { HttpClient } from '@angular/common/http';

declare interface Position {
  offsetX: number;
  offsetY: number;
}
@Directive({
  selector: '[myCanvas]',
})
export class CanvasDirective implements AfterViewInit {
  constructor(
    private el: ElementRef,
    private http: HttpClient
  ) {
    // We use the ElementRef to get direct access to the canvas element. Here we set up the properties of the element. 
    this.canvas = this.el.nativeElement;
    this.canvas.width = 1000;
    this.canvas.height = 800;
    // We create a canvas context. 
    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.lineWidth = 5;
  }
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  // Stroke styles for user and guest
  userStrokeStyle = '#FAD8D6';
  guestStrokeStyle = '#CD5334';
  position: {
    start: {};
    stop: {};
  };
  // This will hold a list of positions recorded throughout the duration of a paint event
  line = [];
  // Since there's no auth setup, we'll need to able to tell users and guests apart.v4 creates a unique id for each user
  userId = v4();
  // This object will hold the start point of any paint event.
   prevPos: Position = {
    offsetX: 0,
    offsetY: 0,
  };
  // This will be set to true when a user starts painting
  isPainting = false;

  @HostListener('mousedown', ['$event'])
  onMouseDown({ offsetX, offsetY }) {
    this.isPainting = true;
    // Get the offsetX and offsetY properties of the event. 
    this.prevPos = {
      offsetX,
      offsetY,
    };
  }
  @HostListener('mousemove', ['$event'])
  onMouseMove({ offsetX, offsetY }) {
    if (this.isPainting) {
      const offSetData = { offsetX, offsetY };
      // Set the start and stop position of the paint event. 
      this.position = {
        start: { ...this.prevPos },
        stop: { ...offSetData },
      };
      // Add the position to the line array
      this.line = this.line.concat(this.position);
      this.draw(this.prevPos, offSetData, this.userStrokeStyle);
    }
  }
  @HostListener('mouseup')
  onMouseUp() {
    if (this.isPainting) {
      this.isPainting = false;
      // Send a request to the server at the end of a paint event
      this.makeRequest();
    }
  }
  @HostListener('mouseleave')
  onmouseleave() {
    if (this.isPainting) {
      this.isPainting = false;
      this.makeRequest();
    }
  }
  @HostBinding('style.background') background = 'black';

  makeRequest() {
    // Make a request to the server containing the user's Id and the line array.
    this.http
      .post('http://localhost:4000/draw', {
        line: this.line,
        userId: this.userId,
      })
      .subscribe((res) => {
        this.line = [];
      });
  }
  // The draw method takes three parameters; the prevPosition, currentPosition and the strokeStyle
  draw(
    { offsetX: x, offsetY: y }: Position,
    { offsetX, offsetY }: Position,
    strokeStyle
  ){
    // begin drawing
    this.ctx.beginPath();
    this.ctx.strokeStyle = strokeStyle;
    // Move the the prevPosition of the mouse
    this.ctx.moveTo(x, y);
    // Draw a line to the current position of the mouse
    this.ctx.lineTo(offsetX, offsetY);
    // Visualize the line using the strokeStyle
    this.ctx.stroke();
    this.prevPos = {
      offsetX,
      offsetY,
    };
  }
  ngAfterViewInit() {}
}