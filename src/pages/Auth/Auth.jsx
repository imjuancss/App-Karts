import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Flag, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import KineticButton from '../../components/ui/KineticButton';
import KineticCard from '../../components/ui/KineticCard';
import KineticInput from '../../components/ui/KineticInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import './Auth.css';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorDesc, setErrorDesc] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorDesc('');
    
    let error = null;

    if (isLogin) {
      const res = await supabase.auth.signInWithPassword({ email, password });
      error = res.error;
    } else {
      const res = await supabase.auth.signUp({ email, password });
      error = res.error;
      if (!error && !res.session) {
        setSuccessMsg('Registro exitoso. Revisa tu correo para confirmar la cuenta antes de iniciar sesión.');
        setErrorDesc('');
        setIsLoading(false);
        return;
      }
    }

    if (error) {
      setErrorDesc(error.message);
      setIsLoading(false);
    } else {
      navigate('/profile');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorDesc('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/profile`
      }
    });
    
    if (error) {
      setErrorDesc(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in px-4 py-8">
      <KineticCard sx={{ width: '100%', maxWidth: '400px', mx: 'auto', p: 2 }}>
        <Stack spacing={3} alignItems="center" mb={3}>
          <div className="logo-icon mb-2">
            <Flag size={32} color="var(--accent)" />
          </div>
          <Typography variant="h4" textAlign="center" sx={{ color: 'white' }}>
            {isLogin ? 'Bienvenido de Vuelta' : 'Comienza tu Carrera'}
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary">
            {isLogin ? 'Ingresa tus credenciales para continuar.' : 'Únete a la mejor comunidad de karting.'}
          </Typography>
        </Stack>

        {errorDesc && (
          <div className="auth-error mb-4 p-3 rounded bg-red-900/30 text-red-200 text-sm">
            <p>{errorDesc}</p>
          </div>
        )}

        {successMsg && (
          <div className="auth-success mb-4 p-3 rounded bg-green-900/30 text-green-200 text-sm">
            <p>{successMsg}</p>
          </div>
        )}

        <KineticButton 
          variant="outlined" 
          fullWidth 
          onClick={handleGoogleLogin} 
          disabled={isLoading}
          sx={{ mb: 3, py: 1.5 }}
          startIcon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          }
        >
          {isLoading ? 'Conectando...' : 'Continuar con Google'}
        </KineticButton>

        <div className="flex items-center justify-center my-4">
          <div className="flex-1 border-t border-gray-700"></div>
          <span className="px-3 text-gray-500 text-sm">O usa tu correo</span>
          <div className="flex-1 border-t border-gray-700"></div>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <KineticInput
            type="email"
            label="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={18} color="rgba(255,255,255,0.5)" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <KineticInput
            type="password"
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={18} color="rgba(255,255,255,0.5)" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <KineticButton 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            disabled={isLoading}
            sx={{ py: 1.5, mt: 2 }}
            endIcon={!isLoading && <ArrowRight size={18} />}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
          </KineticButton>
        </form>

        <Stack alignItems="center" mt={4}>
          <Typography variant="body2" color="text.secondary">
            {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
            <KineticButton 
              variant="text" 
              color="secondary" 
              onClick={() => setIsLogin(!isLogin)}
              sx={{ ml: 1, minWidth: 'auto', p: '4px 8px' }}
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
            </KineticButton>
          </Typography>
        </Stack>
      </KineticCard>
    </div>
  );
}
