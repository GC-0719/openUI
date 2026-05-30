import { Component, Input, Output, EventEmitter, forwardRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'l-switch',
  standalone: true,
  imports: [CommonModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SwitchComponent), multi: true }],
  template: `
    <label class="l-switch" (click)="toggle()">
      <span [class]="'l-switch-track' + (checked ? ' l-switch-on' : '')">
        <span class="l-switch-thumb"></span>
      </span>
      <span *ngIf="label" class="l-switch-label">{{ label }}</span>
    </label>
  `,
})
export class SwitchComponent implements ControlValueAccessor, OnChanges {
  @Input() label = '';
  @Input() disabled = false;
  @Input() active = false;
  @Output() activeChange = new EventEmitter<boolean>();

  checked = false;
  onChange = (_: boolean) => {};
  onTouched = () => {};

  ngOnChanges(changes: SimpleChanges) {
    if (changes['active']) this.checked = this.active;
  }

  toggle() {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.active = this.checked;
    this.activeChange.emit(this.checked);
    this.onChange(this.checked);
    this.onTouched();
  }

  writeValue(v: boolean) { this.checked = !!v; this.active = this.checked; }
  registerOnChange(fn: (v: boolean) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void) { this.onTouched = fn; }
  setDisabledState(d: boolean) { this.disabled = d; }
}
