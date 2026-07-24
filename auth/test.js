import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { registerUser, loginUser } from '../src/auth.js';
import prisma from '../src/db.js';

const testEmail = `test_${Date.now()}@example.com`;
const testPassword = 'testpassword123';

after(async () => {
  // Clean up the test user we created, so repeated test runs don't collide
  await prisma.user.deleteMany({ where: { email: testEmail } });
  await prisma.$disconnect();
});

test('registerUser creates a new user with hashed password', async () => {
  const user = await registerUser('Test User', testEmail, testPassword, 'support');

  assert.equal(user.email, testEmail);
  assert.equal(user.role, 'support');
  assert.equal(user.password, undefined); // must never return the password field

  // Confirm the password was actually hashed in the DB, not stored in plain text
  const dbUser = await prisma.user.findUnique({ where: { email: testEmail } });
  assert.notEqual(dbUser.password, testPassword);
  assert.ok(dbUser.password.startsWith('$2b$')); // bcrypt hash prefix
});

test('registerUser rejects a duplicate email', async () => {
  await assert.rejects(
    () => registerUser('Another User', testEmail, 'somepassword', 'support'),
    /already exists/
  );
});

test('loginUser succeeds with correct credentials and returns a valid token', async () => {
  const result = await loginUser(testEmail, testPassword);

  assert.ok(result.token);
  assert.equal(result.user.email, testEmail);
  assert.equal(result.user.role, 'support');
  assert.equal(result.user.password, undefined);
});

test('loginUser rejects an incorrect password', async () => {
  await assert.rejects(
    () => loginUser(testEmail, 'wrongpassword'),
    /Invalid email or password/
  );
});

test('loginUser rejects a nonexistent email', async () => {
  await assert.rejects(
    () => loginUser('doesnotexist@example.com', 'anypassword'),
    /Invalid email or password/
  );
});