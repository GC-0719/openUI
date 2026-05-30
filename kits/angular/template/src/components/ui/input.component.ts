import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'l-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputComponent), multi: true }],
  template: `
    <div class="l-input-wrap">
      <label *ngIf="label" class="l-input-label">{{ label }}</label>
      <input
        [class]="'l-input' + (error ? ' l-input-error' : '')"
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
      <span *ngIf="error" class="l-input-hint l-input-hint-error">{{ error }}</span>
      <span *ngIf="hint && !error" class="l-input-hint">{{ hint }}</span>
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' = 'text';
  @Input() error = '';
  @Input() hint = '';
  @Input() disabled = false;

  value = '';
  onChange = (_: string) => {};
  onTouched = () => {};

  onInput(e: Event) {
    this.value = (e.target as HTMLInputElement).value;
    this.onChange(this.value);
  }

  writeValue(v: string) { this.value = v ?? ''; }
  registerOnChange(fn: (v: string) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void) { this.onTouched = fn; }
  setDisabledState(d: boolean) { this.disabled = d; }
}
