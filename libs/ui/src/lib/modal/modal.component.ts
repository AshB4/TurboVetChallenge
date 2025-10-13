import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'tvfe-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent {
  @Input()
  open = false;

  @Input()
  closeOnBackdrop = true;

  @Output()
  closed = new EventEmitter<void>();

  onClose(): void {
    this.closed.emit();
  }
}
