import { ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import PageContainer from './PageContainer';
import ContentSection from './ContentSection';
import GlassCard from '../ui/GlassCard';
import KineticButton from '../ui/KineticButton';

const MAX_WIDTH = {
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

export function FormErrorBanner({ children, className }) {
  if (!children) return null;
  return (
    <div className={cn('p-4 bg-error/10 border border-error/30 rounded-sm', className)}>
      <p className="text-error font-label text-sm uppercase tracking-wider">{children}</p>
    </div>
  );
}

export function FormSectionDivider({ title, action, className }) {
  return (
    <div className={cn('flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-outline-variant/10', className)}>
      <h2 className="text-lg md:text-xl font-headline font-bold text-on-surface uppercase tracking-tight">{title}</h2>
      {action}
    </div>
  );
}

export default function CreateFormLayout({
  backLabel = 'Volver',
  onBack,
  title,
  description,
  errorMsg,
  isLoading = false,
  loadingMessage = 'Cargando...',
  maxWidth = '3xl',
  children,
}) {
  if (isLoading) {
    return (
      <PageContainer compact className="min-h-[50vh] items-center justify-center fade-in">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-on-surface-variant font-label uppercase tracking-widest text-sm">{loadingMessage}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="fade-in items-center justify-center min-h-[calc(100dvh-72px)] md:min-h-[calc(100dvh-4rem)]">
      <div className={cn('w-full mx-auto flex flex-col gap-6 md:gap-8 items-center', MAX_WIDTH[maxWidth] ?? MAX_WIDTH['3xl'])}>
        <ContentSection className="w-full flex flex-col items-center md:items-start">
          <KineticButton
            variant="text"
            color="secondary"
            onClick={onBack}
            className="self-center md:self-start"
          >
            <ArrowLeft size={20} aria-hidden="true" />
            {backLabel}
          </KineticButton>
        </ContentSection>

        <GlassCard variant="low" className="w-full p-5 md:p-8">
          <ContentSection>
            <div className="flex flex-col gap-3 text-center items-center">
              <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface uppercase tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="text-on-surface-variant font-body text-sm md:text-base tracking-wide max-w-xl">
                  {description}
                </p>
              )}
            </div>

            <FormErrorBanner>{errorMsg}</FormErrorBanner>

            {children}
          </ContentSection>
        </GlassCard>
      </div>
    </PageContainer>
  );
}
