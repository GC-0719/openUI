import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

let nextInputId = 0;

@Component({
  selector: 'ou-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputComponent), multi: true }],
  template: `
    <div class="ou-input-wrap">
      <label *ngIf="label" class="ou-input-label" [attr.for]="inputId">
        {{ label }}<span *ngIf="required" aria-hidden="true"> *</span>
      </label>
      <input
        [id]="inputId"
        [class]="'ou-input' + (error ? ' ou-input-error' : '')"
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [required]="required"
        [attr.aria-invalid]="error ? true : null"
        [attr.aria-describedby]="describedBy || null"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
      <span *ngIf="error" [id]="errorId" class="ou-input-hint ou-input-hint-error" role="alert">{{ error }}</span>
      <span *ngIf="hint && !error" [id]="hintId" class="ou-input-hint">{{ hint }}</span>
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
  @Input() required = false;

  readonly inputId = `ou-input-${++nextInputId}`;
  readonly errorId = `${this.inputId}-error`;
  readonly hintId = `${this.inputId}-hint`;

  get describedBy(): string {
    const ids: string[] = [];
    if (this.error) ids.push(this.errorId);
    else if (this.hint) ids.push(this.hintId);
    return ids.join(' ');
  }

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
