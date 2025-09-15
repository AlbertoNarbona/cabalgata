const API_BASE_URL = 'http://localhost:3001/api';

export interface LoginCredentials {
  usuario: string;
  contraseña: string;
}

export interface RegisterData {
  usuario: string;
  contraseña: string;
  email: string;
}

export interface User {
  id: number;
  usuario: string;
  email: string;
  ultimo_login?: Date;
  fecha_registro?: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  errors?: Array<{ msg: string; field?: string }>;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    // Cargar token del localStorage al inicializar
    this.token = localStorage.getItem('authToken');
  }

  // Guardar token en localStorage
  private saveToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Eliminar token del localStorage
  private removeToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Obtener headers con autorización
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Manejar respuesta y errores
  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
      // Si hay errores de validación específicos, mostrarlos
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map((err: { msg: string }) => err.msg).join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(data.message || 'Error en la petición');
    }

    return data;
  }

  // LOGIN
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(credentials),
      });

      const data = await this.handleResponse<AuthResponse>(response);

      if (data.success && data.token) {
        this.saveToken(data.token);
      }

      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // REGISTRO
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      const data = await this.handleResponse<AuthResponse>(response);

      if (data.success && data.token) {
        this.saveToken(data.token);
      }

      return data;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  // RECUPERAR CONTRASEÑA
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email }),
      });

      return await this.handleResponse<AuthResponse>(response);
    } catch (error) {
      console.error('Error en forgot password:', error);
      throw error;
    }
  }

  // RESTABLECER CONTRASEÑA
  async resetPassword(token: string, nuevaContraseña: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ token, nuevaContraseña }),
      });

      return await this.handleResponse<AuthResponse>(response);
    } catch (error) {
      console.error('Error en reset password:', error);
      throw error;
    }
  }

  // CAMBIAR CONTRASEÑA (usuario autenticado)
  async changePassword(contraseñaActual: string, nuevaContraseña: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ contraseñaActual, nuevaContraseña }),
      });

      return await this.handleResponse<AuthResponse>(response);
    } catch (error) {
      console.error('Error en change password:', error);
      throw error;
    }
  }

  // VERIFICAR TOKEN
  async verifyToken(): Promise<AuthResponse> {
    try {
      if (!this.token) {
        throw new Error('No hay token disponible');
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse<AuthResponse>(response);
    } catch (error) {
      console.error('Error al verificar token:', error);
      this.removeToken(); // Limpiar token inválido
      throw error;
    }
  }

  // LOGOUT
  logout() {
    this.removeToken();
  }

  // VERIFICAR SI ESTÁ AUTENTICADO
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // OBTENER TOKEN ACTUAL
  getToken(): string | null {
    return this.token;
  }

  // OBTENER USUARIO ACTUAL (decodifica el token JWT)
  getCurrentUser(): User | null {
    if (!this.token) return null;

    try {
      // Decodificar token JWT (base64)
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return {
        id: payload.id,
        usuario: payload.usuario,
        email: payload.email,
      };
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }
}

export default new AuthService();
