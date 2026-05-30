import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'l-radio',
  standalone: true,
  imports: [CommonModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RadioComponent), multi: true }],
  template: `
    <label class="l-radio">
      <input
        type="radio"
        [name]="name"
        [value]="value"
        [checked]="checked"
        [disabled]="disabled"
        (change)="onSelect()"
      />
      <span class="l-radio-circle"></span>
      <span *ngIf="label" class="l-radio-label">{{ label }}</span>
    </label>
  `,
})
export class RadioComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() name = '';
  @Input() value: unknown = '';
  @Input() disabled = false;

  checked = false;
  modelValue: unknown = '';
  onChange = (_: unknown) => {};
  onTouched = () => {};

  onSelect() {
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(v: unknown) {
    this.modelValue = v;
    this.checked = v === this.value;
  }
  registerOnChange(fn: (v: unknown) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void) { this.onTouched = fn; }
  setDisabledState(d: boolean) { this.disabled = d; }
}
