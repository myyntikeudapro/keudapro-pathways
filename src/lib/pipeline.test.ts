import { describe, it, expect } from 'vitest';
import { pipelineColumns } from './crm';
import type { Lead } from './crm';
const l = (status: string, deal_value: number | null, id = status) => ({ id, status, deal_value } as Lead);
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
  it('moves a new lead with an accepted offer to the offer column without closing it', () => {
    const cols = pipelineColumns([l('uusi', null, 'a')], [{ lead_id: 'a', status: 'accepted' }]);
    expect(cols.find(c => c.key === 'kartoitus tehty')?.count).toBe(1);
    expect(cols.find(c => c.key === 'suljettu')?.count).toBe(0);
  });
  it('ignores rejected offers', () => {
    const cols = pipelineColumns([l('uusi', null, 'a')], [{ lead_id: 'a', status: 'rejected' }]);
    expect(cols.find(c => c.key === 'uusi')?.count).toBe(1);
  });
});
