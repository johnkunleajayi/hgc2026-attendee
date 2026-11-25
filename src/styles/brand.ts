export const brand = {
  ink: '#300066',
  green: '#027000',
  red: '#B00000',
  paper: '#FFFFFF',
} as const

export function applyBrand(root: HTMLElement) {
  for (const [role, value] of Object.entries(brand)) root.style.setProperty('--brand-' + role, value)
}
