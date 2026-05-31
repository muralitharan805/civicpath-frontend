---
name: angular-v21-development
description: Guidelines and strict coding standards for developing components, services, state management, and templates in Angular 21+ for civicPath-frontend.
---

# Angular 21 Development Skill

This skill defines the development standards, patterns, and strict guidelines for writing TypeScript, Angular, and templates in this workspace. Any agent modifying or adding code to this project **must** adhere to these rules.

## Core Component Standards

1. **Standalone Components (Default)**
   - All components, directives, and pipes must be standalone.
   - Do **NOT** set `standalone: true` in the `@Component` decorator, as standalone is the default in Angular 20+.
   - Use the `imports: [...]` array directly in `@Component` to specify dependencies.

2. **Change Detection**
   - Always set `changeDetection: ChangeDetectionStrategy.OnPush` in the `@Component` decorator.
   - Example:
     ```typescript
     import { ChangeDetectionStrategy, Component } from '@angular/core';

     @Component({
       selector: 'app-custom-element',
       templateUrl: './custom-element.html',
       styleUrl: './custom-element.scss',
       changeDetection: ChangeDetectionStrategy.OnPush
     })
     export class CustomElementComponent {}
     ```

3. **Host Bindings and Listeners**
   - Do **NOT** use `@HostBinding` and `@HostListener` decorators.
   - Define host bindings/listeners within the `host` configuration object inside the `@Component` or `@Directive` decorator instead.
   - Example:
     ```typescript
     @Component({
       selector: 'app-button',
       template: `<ng-content></ng-content>`,
       host: {
         '[class.active]': 'isActive()',
         '(click)': 'handleClick($event)',
         'role': 'button',
         'tabindex': '0'
       }
     })
     ```

4. **Template and Style Location**
   - Keep templates and styles in external files (e.g., `templateUrl` and `styleUrl`) with paths relative to the component's `.ts` file.
   - For tiny, pure components with less than 20 lines of template, inline templates/styles are acceptable.

---

## State Management and Signals

Always use **Signals** for component state management, input/output structures, and derived state.

1. **Component Inputs and Outputs**
   - Use the signal-based `input()` and `output()` functions instead of `@Input()` and `@Output()` decorators.
   - Required inputs: `myInput = input.required<string>();`
   - Optional inputs: `myInput = input<string>('default');`
   - Outputs: `myEvent = output<string>();` to emit data use `this.myEvent.emit('data');`

2. **Derived State**
   - Use `computed()` for derived calculations and values that depend on other signals.
   - Never perform side effects inside a `computed()` signal; keep them pure.
   - Example:
     ```typescript
     import { Component, computed, input } from '@angular/core';

     export class UserProfileComponent {
       firstName = input.required<string>();
       lastName = input.required<string>();

       // Derived signal
       fullName = computed(() => `${this.firstName()} ${this.lastName()}`);
     }
     ```

3. **Updating Signals**
   - Use `set()` or `update()` to modify signal values.
   - Do **NOT** use `mutate` on signals (it is deprecated or unavailable in newer versions).

---

## Template Syntax and native Control Flow

Avoid old directives (`*ngIf`, `*ngFor`, `*ngSwitch`) and use native Angular control flow.

1. **Native Control Flow (`@if`, `@for`, `@switch`)**
   - Always structure conditional logic and lists using the native syntax.
   - Example:
     ```html
     @if (isLoading()) {
       <div class="spinner">Loading...</div>
     } @else {
       @for (item of items(); track item.id) {
         <app-item-card [item]="item" />
       } @empty {
         <p>No items found.</p>
       }
     }
     ```

2. **Binding Class and Styles**
   - Do **NOT** use `ngClass` or `ngStyle`.
   - Use native Angular class and style bindings:
     - Class binding: `[class.is-visible]="isVisible()"` or `[class]="classString"`
     - Style binding: `[style.color]="textColor()"` or `[style]="styleObject"`

3. **Observable Handlers**
   - Use the `async` pipe inside templates to automatically subscribe to and unsubscribe from RxJS Observables.

4. **Globals Warning**
   - Do not assume global objects or constructors (like `new Date()`) are directly accessible in templates. Keep templates focused purely on component properties and methods.

---

## Services & Dependency Injection

1. **Single Responsibility**
   - Design each service around a single domain logic responsibility.
2. **Provided In Root**
   - Define singleton services using the `{ providedIn: 'root' }` option in the `@Injectable` decorator.
3. **Constructorless Injection**
   - Always use the `inject()` function instead of constructor injection to manage service dependencies.
   - Example:
     ```typescript
     import { Injectable, inject } from '@angular/core';
     import { HttpClient } from '@angular/common/http';

     @Injectable({
       providedIn: 'root'
     })
     export class DataService {
       private readonly http = inject(HttpClient);
     }
     ```

---

## Accessibility (WCAG AA) & SEO Requirements

1. **Accessibility Standards**
   - All components must support screen readers, focus indicators, and custom interactive keyboard navigation.
   - Interactive custom elements must have appropriate ARIA attributes (e.g. `aria-expanded`, `aria-label`, `role="button"`).
   - Ensure the component's focus style is highly visible and respects WCAG AA color contrast ratios (at least 4.5:1 for normal text).
   - All interactive inputs must have associated labels.

2. **Images Optimization**
   - Always use `NgOptimizedImage` (`ngSrc`) for static external/local images to improve SEO and Web Vitals.
   - Note: Do not use `NgOptimizedImage` for base64 inline images.

3. **SEO Best Practices**
   - Pages must have structured headings starting with a single `<h1>` tag per page.
   - Every page should utilize standard descriptive meta tags, titles, and unique CSS IDs on interactive elements for reliable browser test selection.
