import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Radix UI primitives (Select, DropdownMenu, Dialog) rely on pointer-capture and
// scroll APIs that jsdom does not implement. Without these stubs their triggers
// never open under userEvent.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = vi.fn(() => false)
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = vi.fn()
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = vi.fn()
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}

// jsdom ships no ResizeObserver, which Radix Select's positioning depends on.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
