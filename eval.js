const testCases = [
  { question: "What authentication method does the system use?", expectedPages: [1, 3] },
  { question: "How are passwords secured?", expectedPages: [3] },
  { question: "What database does this system use?", expectedPages: [2] },
  { question: "What happens if a JWT token is invalid?", expectedPages: [3] },
  { question: "What are the system's future enhancements?", expectedPages: [13] },
  { question: "Who can manage users in the system?", expectedPages: [2] },
  { question: "What is the capital of France?", expectedPages: [] }, // should refuse
  { question: "What programming language is the backend built with?", expectedPages: [2] },
];

async function runEval() {
  let correct = 0;
  const results = [];

  for (const test of testCases) {
    const response = await fetch('http://localhost:3000/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: test.question })
    });
    const data = await response.json();

    const retrievedPages = data.sources.map((s) => s.page).filter((p) => p !== null);
    const refused = data.sources.length === 0;

    let passed;
    if (test.expectedPages.length === 0) {
      // should have refused
      passed = refused;
    } else {
      // at least one expected page should appear in top results
      passed = test.expectedPages.some((p) => retrievedPages.includes(p));
    }

    if (passed) correct++;

    results.push({
      question: test.question,
      expectedPages: test.expectedPages,
      retrievedPages,
      refused,
      passed
    });

    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${test.question}`);
    console.log(`  Expected pages: ${test.expectedPages.join(', ') || 'none (should refuse)'}`);
    console.log(`  Retrieved pages: ${retrievedPages.join(', ') || 'none'}`);
    console.log(`  Refused: ${refused}`);
    console.log('');
  }

  console.log(`\n=== RESULT: ${correct}/${testCases.length} passed (${Math.round((correct / testCases.length) * 100)}%) ===`);
}

runEval();