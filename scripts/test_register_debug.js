const PocketBase = require('pocketbase/cjs');

(async () => {
  const pb = new PocketBase('http://localhost:8090');
  await pb.admins.authWithPassword('admin@example.com', 'password');

  // Get the players collection to check select options
  const cols = await pb.collections.getList(1, 50);
  const playersCol = cols.items.find(c => c.name === 'players');
  const officeField = playersCol.fields.find(f => f.name === 'office');
  const teamField = playersCol.fields.find(f => f.name === 'team');
  console.log('office field:', JSON.stringify(officeField, null, 2));
  console.log('team field:', JSON.stringify(teamField, null, 2));

  // Try to create a player
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
    console.log('✓ Created player:', record.id);
    await pb.collection('players').delete(record.id);
    console.log('✓ Cleaned up');
  } catch (err) {
    console.error('✗ Create failed:', err.message);
    if (err.response && err.response.data) {
      console.error('  Details:', JSON.stringify(err.response.data, null, 2));
    }
  }
})().catch(e => console.error(e.message));
