export async function getCompanyId(request: Request): Promise<string | null> {
  return request.headers.get('x-company-id');
}

export async function getUserId(request: Request): Promise<string | null> {
  return request.headers.get('x-user-id');
}

export async function getUserRole(request: Request): Promise<string | null> {
  return request.headers.get('x-user-role');
}
