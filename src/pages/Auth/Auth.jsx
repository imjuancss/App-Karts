import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Loader2 } from 'lucide-react';
import KineticButton from '../../components/ui/KineticButton';
import GlassCard from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import PageContainer from '../../components/layout/PageContainer';
import ContentSection from '../../components/layout/ContentSection';
import FormSection from '../../components/layout/FormSection';
import FormField from '../../components/forms/FormField';
import { FormErrorBanner } from '../../components/layout/CreateFormLayout';

const AUTH_COPY = {
  login: {
    title: 'Iniciar sesión',
    description: 'Ingresa tus credenciales para continuar.',
    submit: 'Iniciar sesión',
  },
  register: {
    title: 'Crear cuenta',
    description: 'Únete a la comunidad de karting.',
    submit: 'Registrarse',
  },
};

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorDesc, setErrorDesc] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const copy = AUTH_COPY[authMode];
  const isLogin = authMode === 'login';

  const handleModeChange = (mode) => {
    setAuthMode(mode);
    setErrorDesc('');
    setSuccessMsg('');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorDesc('');
    setSuccessMsg('');

    let error = null;

    if (isLogin) {
      const res = await supabase.auth.signInWithPassword({ email, password });
      error = res.error;
    } else {
      const res = await supabase.auth.signUp({ email, password });
      error = res.error;
      if (!error && !res.session) {
        setSuccessMsg('Registro exitoso. Revisa tu correo para confirmar la cuenta antes de iniciar sesión.');
        setIsLoading(false);
        return;
      }
    }

    if (error) {
      console.error("Auth error:", error);
      setErrorDesc(isLogin ? "Credenciales incorrectas o ocurrió un error." : "Ocurrió un error en el registro. Intenta nuevamente.");
      setIsLoading(false);
    } else {
      navigate('/profile');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorDesc('');
    setSuccessMsg('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/profile`,
      },
    });

    if (error) {
      console.error("OAuth error:", error);
      setErrorDesc("Ocurrió un error en la autenticación.");
      setIsLoading(false);
    }
  };

  return (
    <PageContainer className="fade-in items-center justify-center min-h-[calc(100dvh-72px)] md:min-h-[calc(100dvh-4rem)]">
      <div className="w-full max-w-md mx-auto flex flex-col gap-6 md:gap-8">
        <ContentSection className="w-full flex flex-col items-center md:items-start">
          <KineticButton
            variant="text"
            color="secondary"
            onClick={() => navigate('/')}
            className="self-center md:self-start"
          >
            <ArrowLeft size={20} aria-hidden="true" />
            Volver al inicio
          </KineticButton>
        </ContentSection>

        <GlassCard variant="low" className="w-full p-5 md:p-8">
          <ContentSection>
            <div className="flex flex-col gap-3 text-center items-center">
              <div className="w-14 h-14 bg-surface-container-highest rounded-sm flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-primary-dim text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  flag
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface uppercase tracking-tight">
                {copy.title}
              </h1>
              <p className="text-on-surface-variant font-body text-sm md:text-base tracking-wide max-w-sm">
                {copy.description}
              </p>
            </div>

            <Tabs value={authMode} onValueChange={handleModeChange}>
              <TabsList className="w-full">
                <TabsTrigger value="login" className="flex-1">
                  Iniciar sesión
                </TabsTrigger>
                <TabsTrigger value="register" className="flex-1">
                  Registrarse
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <FormErrorBanner>{errorDesc}</FormErrorBanner>

            {successMsg && (
              <div className="p-4 bg-tertiary-fixed/10 border border-tertiary-fixed/30 rounded-sm">
                <p className="text-tertiary-fixed font-label text-sm uppercase tracking-wider">{successMsg}</p>
              </div>
            )}

            <KineticButton
              type="button"
              variant="contained"
              color="secondary"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-4 normal-case tracking-normal font-body font-medium text-base"
            >
              <GoogleIcon />
              {isLoading ? 'Conectando...' : 'Continuar con Google'}
            </KineticButton>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-outline-variant/15" />
              <span className="text-xs text-on-surface-variant font-label uppercase tracking-widest shrink-0">
                O usa tu correo
              </span>
              <div className="flex-1 h-px bg-outline-variant/15" />
            </div>

            <form onSubmit={handleAuth}>
              <FormSection maxWidth="full" className="gap-4">
                <FormField label="Correo electrónico" htmlFor="auth-email">
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </FormField>

                <FormField
                  label="Contraseña"
                  htmlFor="auth-password"
                  hint={!isLogin ? 'Mínimo 6 caracteres.' : undefined}
                >
                  <Input
                    id="auth-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    minLength={6}
                  />
                </FormField>

                <KineticButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                  className="w-full py-4 mt-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : copy.submit}
                </KineticButton>
              </FormSection>
            </form>
          </ContentSection>
        </GlassCard>
      </div>
    </PageContainer>
  );
}
