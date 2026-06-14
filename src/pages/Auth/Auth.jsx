import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Flag, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import KineticButton from '../../components/ui/KineticButton';
import { Input } from '../../components/ui/input';

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
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] p-8 fade-in">
      <div className="w-full max-w-[440px] p-12 rounded-sm flex flex-col gap-6 bg-surface-container-low/70 backdrop-blur-xl border-none shadow-[0_0_40px_rgba(255,255,255,0.02)]">
        <div className="text-center mb-2">
          <div className="w-16 h-16 mx-auto mb-6 bg-error-container/10 rounded-full flex items-center justify-center">
            <Flag size={32} className="text-primary-dim" />
          </div>
          <h2 className="text-3xl mb-2 bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent font-headline font-bold uppercase tracking-tighter">
            {isLogin ? 'Bienvenido de Vuelta' : 'Comienza tu Carrera'}
          </h2>
          <p className="text-on-surface-variant text-sm">
            {isLogin ? 'Ingresa tus credenciales para continuar.' : 'Únete a la mejor comunidad de karting.'}
          </p>
        </div>

        {errorDesc && (
          <div className="bg-error-container/10 border border-error-container/20 text-error p-4 rounded-sm text-sm text-center">
            <p>{errorDesc}</p>
          </div>
        )}

        {successMsg && (
          <div className="bg-tertiary-fixed/10 border-none text-tertiary-fixed p-4 rounded-sm text-sm text-center">
            <p>{successMsg}</p>
          </div>
        )}

        <button 
          className="flex items-center justify-center gap-3 w-full p-3.5 bg-white/5 border-none text-on-surface rounded-sm text-base font-medium transition-all hover:-translate-y-0.5 hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed" 
          onClick={handleGoogleLogin} 
          disabled={isLoading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {isLoading ? 'Conectando...' : 'Continuar con Google'}
        </button>

        <div className="flex items-center text-center text-on-surface-variant text-sm my-2 before:flex-1 before:border-b before:border-outline-variant/15 after:flex-1 after:border-b after:border-outline-variant/15">
          <span className="px-4">O usa tu correo</span>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div className="relative flex items-center">
            <Mail size={18} className="absolute left-4 text-on-surface-variant pointer-events-none" />
            <Input 
              type="email" 
              placeholder="tu@correo.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-12 py-6"
            />
          </div>
          <div className="relative flex items-center">
            <Lock size={18} className="absolute left-4 text-on-surface-variant pointer-events-none" />
            <Input 
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-12 py-6"
            />
          </div>

          <KineticButton type="submit" variant="contained" color="primary" disabled={isLoading} className="w-full mt-2 justify-between py-4 rounded-sm text-base">
            {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : (
              <>
                <span>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </KineticButton>
        </form>

        <div className="text-center mt-4 text-[0.9rem] text-on-surface-variant">
          <p>
            {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
            <button type="button" className="bg-transparent border-none text-primary-dim font-medium cursor-pointer ml-2 p-0 hover:opacity-80 hover:underline transition-opacity" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
