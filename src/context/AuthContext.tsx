import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import authService, { User, LoginCredentials, RegisterData } from '../services/authService';
import { toast } from 'react-toastify';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const response = await authService.verifyToken();
          if (response.success && response.user) {
            setUser(response.user);
          } else {
            authService.logout();
          }
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);

      if (response.success && response.user) {
        setUser(response.user);
        toast.success('¡Inicio de sesión exitoso!');
        return true;
      } else {
        // Mostrar errores específicos si los hay
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach(error => {
            toast.error(error.msg);
          });
        } else {
          toast.error(response.message || 'Error al iniciar sesión');
        }
        return false;
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast.error('Error de conexión. Intenta de nuevo.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);

      if (response.success && response.user) {
        setUser(response.user);
        toast.success('¡Registro exitoso! Bienvenido.');
        return true;
      } else {
        // Mostrar errores específicos si los hay
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach(error => {
            toast.error(error.msg);
          });
        } else {
          toast.error(response.message || 'Error al registrarse');
        }
        return false;
      }
    } catch (error) {
      console.error('Error en registro:', error);
      toast.error('Error de conexión. Intenta de nuevo.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.info('Sesión cerrada correctamente');
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.forgotPassword(email);

      if (response.success) {
        toast.success('Se han enviado las instrucciones a tu email');
        return true;
      } else {
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach(error => {
            toast.error(error.msg);
          });
        } else {
          toast.error(response.message || 'Error al procesar solicitud');
        }
        return false;
      }
    } catch (error) {
      console.error('Error en forgot password:', error);
      toast.error('Error de conexión. Intenta de nuevo.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.resetPassword(token, newPassword);

      if (response.success) {
        toast.success('Contraseña restablecida exitosamente');
        return true;
      } else {
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach(error => {
            toast.error(error.msg);
          });
        } else {
          toast.error(response.message || 'Error al restablecer contrasena');
        }
        return false;
      }
    } catch (error) {
      console.error('Error en reset password:', error);
      toast.error('Error de conexión. Intenta de nuevo.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.changePassword(currentPassword, newPassword);

      if (response.success) {
        toast.success('Contraseña cambiada exitosamente');
        return true;
      } else {
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach(error => {
            toast.error(error.msg);
          });
        } else {
          toast.error(response.message || 'Error al cambiar contrasena');
        }
        return false;
      }
    } catch (error) {
      console.error('Error en change password:', error);
      toast.error('Error de conexión. Intenta de nuevo.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
