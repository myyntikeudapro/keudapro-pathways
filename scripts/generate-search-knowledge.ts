// Explicit public catalogue projection; never accept client-selected source text or destination links.
import { writeFileSync } from 'node:fs';
import { searchIndex } from '../src/data/searchIndex';
const entries = searchIndex.map(({id,title,description,href,category,keywords}) => ({id,title,description,href,category,keywords}));
writeFileSync('supabase/functions/smart-search/public-index.json', JSON.stringify(entries,null,2)+'\n');
