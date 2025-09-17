import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formData, setFormData] = useState({
    usuario: '',
    contrasena: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  // Validación del formulario
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.usuario.trim()) {
      newErrors.usuario = 'El usuario es requerido';
    } else if (formData.usuario.length < 3) {
      newErrors.usuario = 'El usuario debe tener al menos 3 caracteres';
    }

    if (!formData.contrasena) {
      newErrors.contrasena = 'La contrasena es requerida';
    } else if (formData.contrasena.length < 6) {
      newErrors.contrasena = 'La contrasena debe tener al menos 6 caracteres';
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
    
    if (!validateForm()) return;

    const success = await login(formData);
    if (success) {
      navigate('/dashboard'); // Redirigir al dashboard después del login exitoso
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Volver al inicio
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa tu usuario y contrasena para acceder
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Usuario <span className="text-error-500">*</span>
                  </Label>
                  <Input 
                    placeholder="Ingresa tu usuario"
                    value={formData.usuario}
                    onChange={(e) => handleInputChange('usuario', e.target.value)}
                    className={errors.usuario ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.usuario && (
                    <p className="mt-1 text-sm text-red-500">{errors.usuario}</p>
                  )}
                </div>
                <div>
                  <Label>
                    Contraseña <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu contrasena"
                      value={formData.contrasena}
                      onChange={(e) => handleInputChange('contrasena', e.target.value)}
                      className={errors.contrasena ? 'border-red-500' : ''}
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
                  {errors.contrasena && (
                    <p className="mt-1 text-sm text-red-500">{errors.contrasena}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Mantener sesión iniciada
                    </span>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    ¿Olvidaste tu contrasena?
                  </Link>
                </div>
                <div>
                  <Button 
                    type="submit"
                    className="w-full" 
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                ¿No tienes una cuenta? {""}
                <Link
                  to="/register"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Regístrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
