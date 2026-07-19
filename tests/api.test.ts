const BASE = process.env.BASE_URL || 'http://localhost:3000';

let passed = 0;
let failed = 0;
let companyId = '';
let token = '';
let userId = '';
let employeeId = '';
let taskId = '';
let _messageId = '';
let _salaryId = '';
let _notificationId = '';

const results: string[] = [];

function assert(condition: boolean, name: string, detail?: string) {
  if (condition) {
    passed++;
    results.push(`  ✓ ${name}`);
  } else {
    failed++;
    results.push(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function req(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>
): Promise<{ status: number; data: any; headers: Headers }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: any;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return { status: res.status, data, headers: res.headers };
}

// ─── TEST GROUP: Auth (Public) ───

async function testRegisterValidation() {
  const { status } = await req('POST', '/api/auth/register', {});
  assert(status === 400, 'POST /api/auth/register rejects empty body', `got ${status}`);
}

async function testLoginValidation() {
  const { status } = await req('POST', '/api/auth/login', {});
  assert(status === 400, 'POST /api/auth/login rejects empty body', `got ${status}`);
}

async function testLoginBadCredentials() {
  const { status } = await req('POST', '/api/auth/login', {
    email: 'nonexistent@test.com',
    password: 'wrong',
  });
  assert(status === 401, 'POST /api/auth/login returns 401 for bad credentials', `got ${status}`);
}

async function testCompaniesPublic() {
  const { status, data } = await req('GET', '/api/companies');
  assert(status === 200, 'GET /api/companies works without auth', `got ${status}`);
  assert(Array.isArray(data.companies), 'returns companies array');
  if (data.companies && data.companies.length > 0) {
    companyId = data.companies[0].id;
  }
}

const CEO_EMAIL = `ceo-${Date.now()}@testcorp.com`;
const CEO_PASSWORD = 'CEOpass123!';

async function testRegisterCEO() {
  if (!companyId) {
    const compRes = await req('POST', '/api/companies', {
      name: 'TestCorp E2E',
      industry: 'Technology',
    });
    assert(
      compRes.status === 201,
      'created test company for registration',
      `got ${compRes.status}`
    );
    companyId = compRes.data.company.id;
  }

  const { status, data } = await req('POST', '/api/auth/register', {
    email: CEO_EMAIL,
    password: CEO_PASSWORD,
    name: 'Test CEO',
    companyId,
  });
  assert(status === 201, 'POST /api/auth/register creates CEO', `got ${status}`);
  assert(data.user, 'response contains user object');
  assert(data.token, 'response contains token');
  assert(
    (data as Record<string, unknown>).user &&
      (data as Record<string, unknown>).user &&
      typeof (data as Record<string, Record<string, unknown>>).user === 'object' &&
      (data as Record<string, Record<string, unknown>>).user.role === 'CEO',
    'first user gets CEO role',
    `got ${(data as Record<string, Record<string, unknown>>).user?.role}`
  );
  token = data.token;
  userId = data.user.id;
}

async function testRegisterDuplicate() {
  const { status, data } = await req('POST', '/api/auth/register', {
    email: `ceo-dup-${Date.now()}@testcorp.com`,
    password: 'pass12345',
    name: 'Dup',
    companyId,
  });
  assert(status === 201, 'second user registration succeeds', `got ${status}`);
  assert(
    data.user.role === 'DEVELOPER',
    'second user gets DEVELOPER role',
    `got ${data.user.role}`
  );
}

async function testLoginValid() {
  const { status, data } = await req('POST', '/api/auth/login', {
    email: CEO_EMAIL,
    password: CEO_PASSWORD,
  });
  assert(status === 200, 'POST /api/auth/login succeeds with valid credentials', `got ${status}`);
  assert(data.token, 'response contains token');
  assert(data.user, 'response contains user');
  assert(data.user.email === CEO_EMAIL, 'returned user email matches', `got ${data.user?.email}`);
  assert(data.user.role === 'CEO', 'returned user is CEO', `got ${data.user?.role}`);
  assert(
    data.user.companyId === companyId,
    'returned companyId matches',
    `got ${data.user?.companyId} vs ${companyId}`
  );
}

// ─── TEST GROUP: Authenticated User ───

async function testGetMe() {
  const { status, data } = await req('GET', '/api/users/me');
  assert(status === 200, 'GET /api/users/me returns current user', `got ${status}`);
  assert(data.user, 'response contains user');
  assert(
    data.user.id === userId,
    'user ID matches registered user',
    `got ${data.user?.id} vs ${userId}`
  );
}

async function testGetMeNoAuth() {
  const saved = token;
  token = '';
  const { status } = await req('GET', '/api/users/me');
  assert(status === 401, 'GET /api/users/me returns 401 without token', `got ${status}`);
  token = saved;
}

// ─── TEST GROUP: Users ───

async function testListUsers() {
  const { status, data } = await req('GET', '/api/users', undefined, {
    'x-company-id': companyId,
  });
  assert(status === 200, 'GET /api/users lists company users', `got ${status}`);
  assert(Array.isArray(data.users), 'returns users array');
  assert(data.users.length >= 1, `at least 1 user, got ${data.users.length}`);
}

async function testListUsersNoCompanyHeader() {
  const { status } = await req('GET', '/api/users', undefined, {});
  assert(status === 200, 'GET /api/users works with proxy-set companyId', `got ${status}`);
}

async function testCreateEmployee() {
  const empEmail = `emp-${Date.now()}@testcorp.com`;
  const { status, data } = await req(
    'POST',
    '/api/users',
    {
      email: empEmail,
      password: 'EmpPass123!',
      name: 'Test Employee',
      role: 'DEVELOPER',
      phone: '+1234567890',
    },
    { 'x-company-id': companyId, 'x-user-role': 'CEO' }
  );
  assert(status === 201, 'POST /api/users creates employee', `got ${status}`);
  assert(data.user, 'response contains user');
  assert(data.user.name === 'Test Employee', 'employee name matches');
  assert(data.user.role === 'DEVELOPER', 'employee role matches', `got ${data.user.role}`);
  assert(data.user.email === empEmail, 'employee email matches');
  employeeId = data.user.id;
}

async function testCreateEmployeeValidation() {
  const { status } = await req(
    'POST',
    '/api/users',
    { email: 'x@x.com' },
    { 'x-company-id': companyId, 'x-user-role': 'CEO' }
  );
  assert(status === 400, 'POST /api/users rejects incomplete employee', `got ${status}`);
}

async function testCreateEmployeeRBAC() {
  const empEmail = `emp-rbac-${Date.now()}@testcorp.com`;
  const { status } = await req(
    'POST',
    '/api/users',
    {
      email: empEmail,
      password: 'EmpPass123!',
      name: 'RBAC Test',
      role: 'DEVELOPER',
    },
    { 'x-company-id': companyId, 'x-user-role': 'DEVELOPER' }
  );
  assert(status === 403, 'POST /api/users returns 403 for non-manager', `got ${status}`);
}

// ─── TEST GROUP: Tasks ───

async function testListTasksEmpty() {
  const { status, data } = await req('GET', '/api/tasks', undefined, {
    'x-company-id': companyId,
  });
  assert(status === 200, 'GET /api/tasks returns 200', `got ${status}`);
  assert(Array.isArray(data.tasks), 'returns tasks array');
}

async function testCreateTask() {
  const { status, data } = await req(
    'POST',
    '/api/tasks',
    {
      title: 'E2E Test Task',
      description: 'Created by API test',
      priority: 'HIGH',
    },
    { 'x-company-id': companyId, 'x-user-id': userId, 'x-user-role': 'CEO' }
  );
  assert(status === 201, 'POST /api/tasks creates task', `got ${status}`);
  assert(data.task, 'response contains task');
  assert(data.task.title === 'E2E Test Task', 'task title matches');
  assert(data.task.status === 'TODO', 'task has default TODO status', `got ${data.task.status}`);
  assert(data.task.priority === 'HIGH', 'task priority is HIGH', `got ${data.task.priority}`);
  assert(data.task.creator, 'task has creator info');
  taskId = data.task.id;
}

async function testCreateTaskNoTitle() {
  const { status } = await req(
    'POST',
    '/api/tasks',
    { description: 'no title' },
    { 'x-company-id': companyId, 'x-user-id': userId, 'x-user-role': 'CEO' }
  );
  assert(status === 400, 'POST /api/tasks rejects task without title', `got ${status}`);
}

async function testCreateTaskRBAC() {
  const { status } = await req(
    'POST',
    '/api/tasks',
    { title: 'RBAC Test' },
    { 'x-company-id': companyId, 'x-user-id': userId, 'x-user-role': 'DESIGNER' }
  );
  assert(status === 403, 'POST /api/tasks returns 403 for DESIGNER', `got ${status}`);
}

async function testUpdateTask() {
  const { status, data } = await req(
    'PUT',
    `/api/tasks/${taskId}`,
    { status: 'IN_PROGRESS', priority: 'URGENT', title: 'Updated E2E Task' },
    { 'x-company-id': companyId, 'x-user-role': 'CEO' }
  );
  assert(status === 200, 'PUT /api/tasks/[id] updates task', `got ${status}`);
  assert(data.status === 'IN_PROGRESS', 'task status updated to IN_PROGRESS', `got ${data.status}`);
  assert(data.priority === 'URGENT', 'task priority updated to URGENT', `got ${data.priority}`);
  assert(data.title === 'Updated E2E Task', 'task title updated');
}

async function testUpdateTaskNotFound() {
  const { status } = await req(
    'PUT',
    '/api/tasks/nonexistent',
    { title: 'x' },
    { 'x-company-id': companyId, 'x-user-role': 'CEO' }
  );
  assert(status === 404, 'PUT /api/tasks/[id] returns 404 for bad id', `got ${status}`);
}

// ─── TEST GROUP: Messages ───

async function testListMessagesEmpty() {
  const { status, data } = await req('GET', '/api/messages', undefined, {
    'x-company-id': companyId,
    'x-user-id': userId,
  });
  assert(status === 200, 'GET /api/messages returns 200', `got ${status}`);
  assert(Array.isArray(data.messages), 'returns messages array');
}

async function testSendMessage() {
  const { status, data } = await req(
    'POST',
    '/api/messages',
    { content: 'Hello from E2E test!', receiverId: employeeId },
    { 'x-company-id': companyId, 'x-user-id': userId, 'x-user-role': 'CEO' }
  );
  assert(status === 201, 'POST /api/messages sends message', `got ${status}`);
  assert(data.message, 'response contains message');
  assert(data.message.content === 'Hello from E2E test!', 'message content matches');
  assert(data.message.sender, 'message has sender info');
  assert(data.message.receiver, 'message has receiver info');
  messageId = data.message.id;
}

async function testSendMessageValidation() {
  const { status } = await req(
    'POST',
    '/api/messages',
    { content: 'missing receiver' },
    { 'x-company-id': companyId, 'x-user-id': userId, 'x-user-role': 'CEO' }
  );
  assert(status === 400, 'POST /api/messages rejects message without receiverId', `got ${status}`);
}

async function testListMessagesHasSent() {
  const { status, data } = await req('GET', '/api/messages', undefined, {
    'x-company-id': companyId,
    'x-user-id': userId,
  });
  assert(status === 200, 'GET /api/messages returns 200 after sending', `got ${status}`);
  assert(
    data.messages.length >= 1,
    'messages array has at least 1 entry',
    `got ${data.messages.length}`
  );
}

// ─── TEST GROUP: Salary ───

async function testListSalaryEmpty() {
  const { status, data } = await req('GET', '/api/salary', undefined, {
    'x-company-id': companyId,
    'x-user-role': 'CEO',
  });
  assert(status === 200, 'GET /api/salary returns 200', `got ${status}`);
  assert(Array.isArray(data.salaries), 'returns salaries array');
}

async function testListSalaryRBAC() {
  const { status } = await req('GET', '/api/salary', undefined, {
    'x-company-id': companyId,
    'x-user-role': 'DEVELOPER',
  });
  assert(status === 403, 'GET /api/salary returns 403 for DEVELOPER', `got ${status}`);
}

async function testCreateSalary() {
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { status, data } = await req(
    'POST',
    '/api/salary',
    { userId: employeeId, amount: 5000, dueDate },
    { 'x-company-id': companyId, 'x-user-role': 'CEO' }
  );
  assert(status === 201, 'POST /api/salary creates salary record', `got ${status}`);
  assert(data.salary, 'response contains salary');
  assert(data.salary.amount === 5000, 'salary amount is 5000', `got ${data.salary.amount}`);
  assert(data.salary.status === 'PENDING', 'salary status is PENDING', `got ${data.salary.status}`);
  assert(data.salary.user, 'salary has user info');
  salaryId = data.salary.id;
}

async function testCreateSalaryValidation() {
  const { status } = await req(
    'POST',
    '/api/salary',
    { userId: employeeId },
    { 'x-company-id': companyId, 'x-user-role': 'CEO' }
  );
  assert(status === 400, 'POST /api/salary rejects incomplete salary', `got ${status}`);
}

async function testCreateSalaryRBAC() {
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { status } = await req(
    'POST',
    '/api/salary',
    { userId: employeeId, amount: 5000, dueDate },
    { 'x-company-id': companyId, 'x-user-role': 'MANAGER' }
  );
  assert(status === 403, 'POST /api/salary returns 403 for MANAGER', `got ${status}`);
}

// ─── TEST GROUP: Notifications ───

async function testListNotificationsEmpty() {
  const { status, data } = await req('GET', '/api/notifications', undefined, {
    'x-company-id': companyId,
    'x-user-id': userId,
  });
  assert(status === 200, 'GET /api/notifications returns 200', `got ${status}`);
  assert(Array.isArray(data.notifications), 'returns notifications array');
  assert(typeof data.unreadCount === 'number', 'returns unread count');
}

async function testCreateNotification() {
  const { status, data } = await req(
    'POST',
    '/api/notifications',
    {
      userId,
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'TASK',
    },
    { 'x-company-id': companyId }
  );
  assert(status === 201, 'POST /api/notifications creates notification', `got ${status}`);
  assert(data.notification, 'response contains notification');
  assert(data.notification.title === 'Test Notification', 'notification title matches');
  assert(
    data.notification.type === 'TASK',
    'notification type is TASK',
    `got ${data.notification.type}`
  );
  notificationId = data.notification.id;
}

async function testListNotificationsHasOne() {
  const { status, data } = await req('GET', '/api/notifications', undefined, {
    'x-company-id': companyId,
    'x-user-id': userId,
  });
  assert(status === 200, 'GET /api/notifications returns 200 after creating', `got ${status}`);
  assert(
    data.notifications.length >= 1,
    'notifications array has at least 1',
    `got ${data.notifications.length}`
  );
  assert(data.unreadCount >= 1, 'unread count >= 1', `got ${data.unreadCount}`);
}

// ─── TEST GROUP: Auth Edge Cases ───

async function testRegisterDuplicateEmail() {
  const email = `unique-${Date.now()}@testcorp.com`;
  await req('POST', '/api/auth/register', {
    email,
    password: 'pass12345',
    name: 'Unique User',
    companyId,
  });
  const { status } = await req('POST', '/api/auth/register', {
    email,
    password: 'pass45678',
    name: 'Duplicate User',
    companyId,
  });
  assert(status === 409, 'POST /api/auth/register rejects duplicate email', `got ${status}`);
}

// ─── RUNNER ───

async function run() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   Nescom E2E API Test Suite              ║');
  console.log('╚══════════════════════════════════════════╝\n');

  const groups: [string, (() => Promise<void>)[]][] = [
    [
      'Auth (Public)',
      [
        testRegisterValidation,
        testLoginValidation,
        testLoginBadCredentials,
        testCompaniesPublic,
        testRegisterCEO,
        testLoginValid,
        testRegisterDuplicate,
        testRegisterDuplicateEmail,
      ],
    ],
    ['Current User', [testGetMe, testGetMeNoAuth]],
    [
      'Users',
      [
        testListUsers,
        testListUsersNoCompanyHeader,
        testCreateEmployee,
        testCreateEmployeeValidation,
        testCreateEmployeeRBAC,
      ],
    ],
    [
      'Tasks',
      [
        testListTasksEmpty,
        testCreateTask,
        testCreateTaskNoTitle,
        testCreateTaskRBAC,
        testUpdateTask,
        testUpdateTaskNotFound,
      ],
    ],
    [
      'Messages',
      [testListMessagesEmpty, testSendMessage, testSendMessageValidation, testListMessagesHasSent],
    ],
    [
      'Salary',
      [
        testListSalaryEmpty,
        testListSalaryRBAC,
        testCreateSalary,
        testCreateSalaryValidation,
        testCreateSalaryRBAC,
      ],
    ],
    [
      'Notifications',
      [testListNotificationsEmpty, testCreateNotification, testListNotificationsHasOne],
    ],
  ];

  for (const [name, tests] of groups) {
    console.log(`── ${name} ──`);
    for (const fn of tests) {
      try {
        await fn();
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        failed++;
        results.push(`  ✗ ${fn.name} — threw: ${message}`);
      }
    }
  }

  console.log('\n' + results.join('\n'));
  console.log(`\n══════════════════════════════════════════`);
  console.log(`  Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`══════════════════════════════════════════\n`);

  process.exit(failed > 0 ? 1 : 0);
}

run();
