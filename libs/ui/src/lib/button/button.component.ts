import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'tvfe-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
})
export class ButtonComponent {
  /**
   * Sets the native button type attribute; defaults to `button`.
   */
  @Input()
  type: 'button' | 'submit' | 'reset' = 'button';

  /**
   * Indicates a primary action for styling purposes.
   */
  @Input()
  variant: 'primary' | 'secondary' | 'ghost' = 'primary';

  @Input()
  disabled = false;

  get classes(): string {
    return `btn ${this.variant}`;
  }
}
