import { spawn } from 'child_process';

const testFiles = [
  'tests/unit/contextEngine.test.ts',
  'tests/integration/api.test.ts',
  'tests/integration/websocket.test.ts',
];

async function run() {
  console.log('--- Running SenseWeave Automated Verification Tests ---');
  let hasFailed = false;

  for (const file of testFiles) {
    console.log(`\n>> Executing: ${file}`);
    await new Promise((resolve) => {
      const p = spawn('node', ['--test', file], {
        stdio: 'inherit',
        env: process.env,
      });
      p.on('exit', (code) => {
        if (code !== 0) {
          hasFailed = true;
          console.error(`FAILED: ${file}`);
        } else {
          console.log(`PASSED: ${file}`);
        }
        resolve(code);
      });
    });
  }

  if (hasFailed) {
    console.error('\nOne or more test suites failed.');
    process.exit(1);
  } else {
    console.log('\nAll SenseWeave test suites passed successfully!');
    process.exit(0);
  }
}

run();
