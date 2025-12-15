/**
 * Função helper para fazer requisições à API com autenticação JWT
 */
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem('authToken');
  const refreshToken = localStorage.getItem('refreshToken');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(
    `http://localhost:3001/api${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (response.status === 401) {
    // Tentar refresh se disponível
    if (refreshToken) {
      try {
        const r = await fetch(`http://localhost:3001/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (r.ok) {
          const data = await r.json();
          const newToken = data.token;
          if (newToken) {
            localStorage.setItem('authToken', newToken);
            headers['Authorization'] = `Bearer ${newToken}`;
            // Repetir requisição original
            response = await fetch(
              `http://localhost:3001/api${endpoint}`,
              {
                ...options,
                headers,
              }
            );
          }
        }
      } catch (e) {
        // Ignorar e prosseguir para limpeza
      }
    }

    // Se ainda 401, limpar e redirecionar
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userAddress');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  return response;
}

/**
 * Função para fazer requisições GET com autenticação
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Função para fazer requisições POST com autenticação
 */
export async function apiPost<T>(
  endpoint: string,
  body: any
): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Função para fazer requisições PUT com autenticação
 */
export async function apiPut<T>(
  endpoint: string,
  body: any
): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Função para fazer requisições DELETE com autenticação
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.statusText}`);
  }

  return response.json();
}
