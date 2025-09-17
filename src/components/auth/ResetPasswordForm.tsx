import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    nuevaContraseña: '',
    confirmarContraseña: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [token, setToken] = useState<string | null>(null);
  
  const { resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Obtener token de la URL
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (!urlToken) {
      navigate('/forgot-password');
      return;
    }
    setToken(urlToken);
  }, [searchParams, navigate]);

  // Validación del formulario
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validar contrasena (criterios de seguridad)
    if (!formData.nuevaContraseña) {
      newErrors.nuevaContraseña = 'La contrasena es requerida';
    } else if (formData.nuevaContraseña.length < 8) {
      newErrors.nuevaContraseña = 'La contrasena debe tener al menos 8 caracteres';
    }

    // Validar confirmación de contrasena
    if (!formData.confirmarContraseña) {
      newErrors.confirmarContraseña = 'Debes confirmar la contrasena';
    } else if (formData.nuevaContraseña !== formData.confirmarContraseña) {
      newErrors.confirmarContraseña = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !token) return;

    const success = await resetPassword(token, formData.nuevaContraseña);
    if (success) {
      navigate('/login');
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col flex-1">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="text-center">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Token Inválido
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              El enlace de recuperación no es válido o ha expirado.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
            >
              Solicitar Nuevo Enlace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Volver al login
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Restablecer Contraseña
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa tu nueva contrasena para restablecer el acceso a tu cuenta.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Nueva Contraseña <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu nueva contrasena"
                      value={formData.nuevaContraseña}
                      onChange={(e) => handleInputChange('nuevaContraseña', e.target.value)}
                      className={errors.nuevaContraseña ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  {errors.nuevaContraseña && (
                    <p className="mt-1 text-sm text-red-500">{errors.nuevaContraseña}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Mínimo 8 caracteres con mayúscula, minúscula, número y símbolo
                  </p>
                </div>

                <div>
                  <Label>
                    Confirmar Contraseña <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirma tu nueva contrasena"
                      value={formData.confirmarContraseña}
                      onChange={(e) => handleInputChange('confirmarContraseña', e.target.value)}
                      className={errors.confirmarContraseña ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  {errors.confirmarContraseña && (
                    <p className="mt-1 text-sm text-red-500">{errors.confirmarContraseña}</p>
                  )}
                </div>

                <div>
                  <Button 
                    type="submit"
                    className="w-full" 
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                ¿Recordaste tu contrasena? {""}
                <Link
                  to="/login"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Iniciar Sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
