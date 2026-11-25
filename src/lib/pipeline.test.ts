import { describe, it, expect } from 'vitest';
import { pipelineColumns } from './crm';
import type { Lead } from './crm';
const l = (status: string, deal_value: number | null) => ({ status, deal_value } as Lead);
describe('pipelineColumns', () => {
  it('groups won and lost into the closed column', () => {
    const cols = pipelineColumns([l('koulutukseen', 1000), l('ei jatkoon', null), l('uusi', 500)]);
    expect(cols.find(c => c.key === 'suljettu')?.count).toBe(2);
    expect(cols.find(c => c.key === 'uusi')?.count).toBe(1);
  });
  it('sums deal values per column, missing values as zero', () => {
    const cols = pipelineColumns([l('yhteydessä', 1200), l('yhteydessä', null), l('yhteydessä', 300)]);
    expect(cols.find(c => c.key === 'yhteydessä')?.total).toBe(1500);
  });
});
