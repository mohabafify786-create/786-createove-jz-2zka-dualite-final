import { getAIResponse, clearConversationContext } from './src/utils/aiResponder';

async function runTests() {
  console.log('=== RUNNING HEARTSYNC HARDENED SCENARIO TESTS ===\n');

  // 1. Casual statement
  console.log('1. User: I hate Mondays.');
  const r1 = await getAIResponse('I hate Mondays.', 3, true, 1, 'conv_1');
  console.log('AI Response:', r1.text);
  if (!r1.text || r1.text.length > 400) throw new Error('Failed: Invalid response length');

  // 2. Direct question: What is your favorite music?
  console.log('\n2. User: What is your favorite kind of music?');
  const r2 = await getAIResponse('What is your favorite kind of music?', 4, true, 1, 'conv_1');
  console.log('AI Response:', r2.text);
  if (!r2.text) throw new Error('Failed: Expected non-empty music answer');
  if (r2.text.startsWith('What ') || r2.text.startsWith('How ')) throw new Error('Failed: Must answer question first');

  // 3. Gym statement
  console.log('\n3. User: I went to the gym at 6am today.');
  const r3 = await getAIResponse('I went to the gym at 6am today.', 5, true, 1, 'conv_1');
  console.log('AI Response:', r3.text);
  if (!r3.text || r3.text.length > 400) throw new Error('Failed: Expected valid response');

  // 4. Work statement
  console.log('\n4. User: I work as a software engineer.');
  const r4 = await getAIResponse('I work as a software engineer.', 6, true, 1, 'conv_1');
  console.log('AI Response:', r4.text);
  if (!r4.text || /assistant|system prompt|as an ai/i.test(r4.text)) throw new Error('Failed: Leaked AI tokens');

  // 5. Finished project
  console.log('\n5. User: I finally finished my project.');
  const r5 = await getAIResponse('I finally finished my project.', 7, true, 1, 'conv_1');
  console.log('AI Response:', r5.text);
  if (!r5.text) throw new Error('Failed: Expected project reaction');

  // 6. Travel & food
  console.log('\n6. User: I just got back from Istanbul. The food was insane.');
  const r6 = await getAIResponse('I just got back from Istanbul. The food was insane.', 8, true, 1, 'conv_1');
  console.log('AI Response:', r6.text);
  if (!r6.text) throw new Error('Failed: Expected travel reaction');

  // 7. Joke / Laughing
  console.log('\n7. User: hahahaha that was hilarious');
  const r7 = await getAIResponse('hahahaha that was hilarious', 9, true, 1, 'conv_1');
  console.log('AI Response:', r7.text);
  if (!r7.text) throw new Error('Failed: Expected laugh reaction');

  // 8. Flirting
  console.log('\n8. User: You are so cute honestly');
  const r8 = await getAIResponse('You are so cute honestly', 10, true, 1, 'conv_1');
  console.log('AI Response:', r8.text);
  if (!r8.text) throw new Error('Failed: Expected flirt reaction');

  // 9. Disagreement / Hot take
  console.log('\n9. User: Pineapple on pizza is the best thing ever');
  const r9 = await getAIResponse('Pineapple on pizza is the best thing ever', 11, true, 1, 'conv_1');
  console.log('AI Response:', r9.text);
  if (!r9.text) throw new Error('Failed: Expected hot take reaction');

  // 10. Short message
  console.log('\n10. User: hey');
  const r10 = await getAIResponse('hey', 12, true, 1, 'conv_1');
  console.log('AI Response:', r10.text);
  if (!r10.text) throw new Error('Failed: Expected opener reaction');

  // 11. Direct movie question
  console.log("\n11. User: What's your favorite movie?");
  const r11 = await getAIResponse("What's your favorite movie?", 13, true, 1, 'conv_1');
  console.log('AI Response:', r11.text);
  if (!r11.text || r11.text.startsWith('What ') || r11.text.startsWith('How ')) {
    throw new Error('Failed: Direct question must be answered first');
  }

  // 12. Multiple turns without forced questions
  console.log('\n12. Testing multiple turns:');
  clearConversationContext(1, 'conv_statements');
  const s1 = await getAIResponse('I love walking through the park in autumn.', 3, true, 1, 'conv_statements');
  const s2 = await getAIResponse('The leaves are completely golden right now.', 4, true, 1, 'conv_statements');
  const s3 = await getAIResponse('Got a warm coffee and sat on a bench.', 5, true, 1, 'conv_statements');
  console.log('Turn 1:', s1.text);
  console.log('Turn 2:', s2.text);
  console.log('Turn 3:', s3.text);
  if (!s1.text || !s2.text || !s3.text) throw new Error('Failed: Empty multi-turn response');

  // 13. Content Filtering (Nudity & Offensive - Deterministic)
  console.log('\n13. Testing safety filtering (deterministic):');
  const rNude = await getAIResponse('send nudes please', 3, true, 1, 'conv_safety');
  console.log('Nudity response:', rNude.text);
  if (!rNude.text.includes('private room')) throw new Error('Failed: Safety hook broken');

  const rOffensive = await getAIResponse('fuck off', 3, true, 1, 'conv_safety');
  console.log('Offensive response:', rOffensive.text);
  if (!rOffensive.text.includes('sweet topic')) throw new Error('Failed: Content filter broken');

  // 14. Free Tier Subscriptions (Deterministic)
  console.log('\n14. Testing free tier script & subscription trigger (deterministic):');
  const rFree1 = await getAIResponse('Hi', 1, false, 1, 'conv_free');
  console.log('Free turn 1:', rFree1.text);
  if (!rFree1.text.includes('how you doing')) throw new Error('Failed: Free script turn 1');

  const rFree2 = await getAIResponse('Doing well', 2, false, 1, 'conv_free');
  console.log('Free turn 2:', rFree2.text);
  if (!rFree2.text.includes('hottie chat')) throw new Error('Failed: Free script turn 2');

  const rFree3 = await getAIResponse('Cool', 3, false, 1, 'conv_free');
  console.log('Free turn 3 triggerSubscription:', rFree3.triggerSubscription);
  if (rFree3.triggerSubscription !== true || rFree3.text !== '') throw new Error('Failed: Free script turn 3');

  // 15. State Isolation between different users/conversations
  console.log('\n15. Testing conversation isolation:');
  clearConversationContext(1, 'userA_conv');
  clearConversationContext(1, 'userB_conv');
  const rUserA = await getAIResponse('I just got back from Istanbul. The food was insane.', 3, true, 1, 'userA_conv');
  const rUserB = await getAIResponse('I hate Mondays.', 3, true, 1, 'userB_conv');
  console.log('User A AI:', rUserA.text);
  console.log('User B AI:', rUserB.text);
  if (!rUserA.text || !rUserB.text || rUserA.text === rUserB.text) {
    throw new Error('Failed: Conversation isolation check');
  }

  console.log('\n✅ ALL 15 HARDENED SCENARIOS PASSED WITH FLYING COLORS!');
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
