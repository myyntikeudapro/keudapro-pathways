import { getCountries, getCountryCallingCode } from 'libphonenumber-js';

const names = new Intl.DisplayNames(['fi'], { type: 'region' });
export const phoneCountries = getCountries().map(country => ({
  country, code: `+${getCountryCallingCode(country)}`, name: names.of(country) ?? country,
})).sort((a, b) => a.country === 'FI' ? -1 : b.country === 'FI' ? 1 : a.name.localeCompare(b.name, 'fi'));
export const callingCodes = new Set(phoneCountries.map(c => c.code));