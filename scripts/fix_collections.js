const PocketBase = require('pocketbase/cjs');

(async () => {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('admin@example.com', 'password');

  const cols = await pb.collections.getList(1, 50);
  const playersCol = cols.items.find(c => c.name === 'players');
  const gamesCol = cols.items.find(c => c.name === 'games');

  // 1. Fix office field — change allowed values to English
  const officeField = playersCol.fields.find(f => f.name === 'office');
  officeField.values = ['Beijing', 'Shanghai', 'Hong Kong & Others'];
  console.log('Updated office values:', officeField.values);

  await pb.collections.update(playersCol.id, playersCol);
  console.log('✓ players collection updated');

  // 2. Add bingoPhase field to games collection
  const hasBingoPhase = gamesCol.fields.some(f => f.name === 'bingoPhase');
  if (!hasBingoPhase) {
    gamesCol.fields.push({
      help: '',
      hidden: false,
      id: 'field_bingophase01',
      maxSelect: 1,
      name: 'bingoPhase',
      presentable: false,
      required: false,
      system: false,
      type: 'select',
      values: ['open', 'waiting_score', 'auto_score', 'closed']
    });
    await pb.collections.update(gamesCol.id, gamesCol);
    console.log('✓ games collection: added bingoPhase field');
  } else {
    console.log('- games collection already has bingoPhase');
  }

  // 3. Verify
  const updated = await pb.collections.getList(1, 50);
  const p = updated.items.find(c => c.name === 'players');
  const g = updated.items.find(c => c.name === 'games');
  console.log('\nplayers.office:', p.fields.find(f => f.name === 'office').values);
  console.log('games has bingoPhase:', g.fields.some(f => f.name === 'bingoPhase'));

  // 4. Test create
  try {
    const record = await pb.collection('players').create({
      name: 'TestPlayer',
      phone: '13800000001',
      office: 'Beijing',
      team: 'Alpha',
      totalScore: 0,
      completedGames: [],
      finalSubmitted: false
    });
    console.log('✓ Test create succeeded:', record.id);
    await pb.collection('players').delete(record.id);
    console.log('✓ Test cleanup done');
  } catch (err) {
    console.error('✗ Test create failed:', err.message);
    if (err.response?.data) console.error('  Details:', JSON.stringify(err.response.data));
  }
})().catch(e => console.error(e.message));
