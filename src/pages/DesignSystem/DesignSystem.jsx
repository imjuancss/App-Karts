import React, { useState } from 'react';
import KineticButton from '../../components/ui/KineticButton';
import Badge from '../../components/ui/Badge';
import GlassCard from '../../components/ui/GlassCard';
import HeroHeader from '../../components/ui/HeroHeader';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { SelectNative } from '../../components/ui/select-native';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { FilterGroup, FilterItem } from '../../components/ui/filter-group';

export default function DesignSystem() {
  const [filterValue, setFilterValue] = useState('all');
  return (
    <div className="bg-background text-on-surface min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto font-body">
      <div className="mb-12">
        <h1 className="font-headline text-4xl font-bold uppercase tracking-tighter text-primary-dim mb-2">Velocity Noir</h1>
        <p className="text-on-surface-variant font-label uppercase tracking-widest text-sm">Design System & UI Components</p>
      </div>

      <section className="mb-16">
        <h2 className="font-headline text-2xl font-bold uppercase tracking-tight mb-6 border-b border-surface-container-highest pb-2">1. Buttons (KineticButton)</h2>
        <div className="flex flex-wrap gap-6 items-center bg-surface-container-low p-10 rounded-lg">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-on-surface-variant uppercase font-label">Primary (Contained)</span>
            <KineticButton variant="contained" color="primary">Primary Action</KineticButton>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-on-surface-variant uppercase font-label">Secondary (Contained)</span>
            <KineticButton variant="contained" color="secondary">Secondary Action</KineticButton>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-on-surface-variant uppercase font-label">Error (Contained)</span>
            <KineticButton variant="contained" color="error">Destructive</KineticButton>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-on-surface-variant uppercase font-label">Outlined</span>
            <KineticButton variant="outlined">Outlined Action</KineticButton>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-on-surface-variant uppercase font-label">Text</span>
            <KineticButton variant="text">Text Link</KineticButton>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-on-surface-variant uppercase font-label">Disabled</span>
            <KineticButton variant="contained" disabled>Disabled</KineticButton>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="font-headline text-2xl font-bold uppercase tracking-tight mb-6 border-b border-surface-container-highest pb-2">2. Badges (Status Indicators)</h2>
        <div className="flex flex-wrap gap-6 items-center bg-surface-container-low p-10 rounded-lg">
          <Badge variant="open" pulse>Inscripciones Abiertas</Badge>
          <Badge variant="closed" icon="lock">Cerrado</Badge>
          <Badge variant="ongoing" icon="sync" pulse>En Curso</Badge>
          <Badge variant="default">Por Defecto</Badge>
          <Badge variant="success" icon="check_circle">Completado</Badge>
          <Badge variant="warning" icon="warning">Pendiente</Badge>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="font-headline text-2xl font-bold uppercase tracking-tight mb-6 border-b border-surface-container-highest pb-2">3. Surface Cards (GlassCard)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard variant="glass">
            <h3 className="font-headline font-bold uppercase mb-2">Variant: Glass</h3>
            <p className="text-sm text-on-surface-variant">Uses backdrop-blur and semi-transparent background for overlays.</p>
          </GlassCard>
          
          <GlassCard variant="low">
            <h3 className="font-headline font-bold uppercase mb-2">Variant: Low</h3>
            <p className="text-sm text-on-surface-variant">Standard surface container low. Best for lists or secondary cards.</p>
          </GlassCard>

          <GlassCard variant="high">
            <h3 className="font-headline font-bold uppercase mb-2">Variant: High</h3>
            <p className="text-sm text-on-surface-variant">Surface container high with subtle border.</p>
          </GlassCard>

          <GlassCard variant="highest">
            <h3 className="font-headline font-bold uppercase mb-2">Variant: Highest</h3>
            <p className="text-sm text-on-surface-variant">Maximum contrast surface. Good for emphasized content.</p>
          </GlassCard>

          <GlassCard variant="primary-border">
            <h3 className="font-headline font-bold uppercase mb-2">Variant: Primary Border</h3>
            <p className="text-sm text-on-surface-variant">Surface highest with a thick left border accent.</p>
          </GlassCard>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="font-headline text-2xl font-bold uppercase tracking-tight mb-6 border-b border-surface-container-highest pb-2">4. Complex Composites (HeroHeader)</h2>
        <HeroHeader 
          title="Componente Hero"
          subtitle="Circuito de Prueba / Showcase"
          badgeText="Demo Activo"
          badgeVariant="ongoing"
          imageUrl="https://images.unsplash.com/photo-1541348263662-e06836264b98?auto=format&fit=crop&q=80&w=2000"
        >
          <GlassCard variant="low" className="flex-1 flex flex-col justify-between">
            <div className="relative z-10">
              <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-4 block">Detalles del Demo</span>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary-dim">info</span>
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase font-label">Descripción</p>
                    <p className="font-headline text-sm font-bold">Este bloque lateral se inyecta como children al componente HeroHeader.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>extension</span>
            </div>
          </GlassCard>
        </HeroHeader>
      </section>

      <section className="mb-16">
        <h2 className="font-headline text-2xl font-bold uppercase tracking-tight mb-6 border-b border-surface-container-highest pb-2">5. Forms & Inputs</h2>
        <div className="bg-surface-container-low p-10 rounded-lg flex flex-col gap-8 max-w-2xl">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-on-surface-variant font-label uppercase tracking-widest">Standard Input</label>
            <Input type="text" placeholder="Enter your text here..." />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-on-surface-variant font-label uppercase tracking-widest">Disabled Input</label>
            <Input type="text" placeholder="Disabled..." disabled />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-on-surface-variant font-label uppercase tracking-widest">Textarea</label>
            <Textarea placeholder="Type a longer message here..." rows={4} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-on-surface-variant font-label uppercase tracking-widest">Native Select</label>
            <SelectNative>
              <option value="">Select an option...</option>
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
              <option value="3">Option 3</option>
            </SelectNative>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="font-headline text-2xl font-bold uppercase tracking-tight mb-6 border-b border-surface-container-highest pb-2">6. Navigation (Tabs)</h2>
        <div className="bg-surface-container-low p-10 rounded-lg max-w-3xl">
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Pestaña 1</TabsTrigger>
              <TabsTrigger value="tab2">Pestaña 2</TabsTrigger>
              <TabsTrigger value="tab3">Pestaña 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="p-4 bg-surface-container mt-4 rounded-sm text-sm text-on-surface-variant">
              Contenido de la primera pestaña. Ideal para mostrar información de campeonatos o tiempos de vuelta.
            </TabsContent>
            <TabsContent value="tab2" className="p-4 bg-surface-container mt-4 rounded-sm text-sm text-on-surface-variant">
              Contenido de la segunda pestaña. Los Tabs utilizan un diseño "Pill-style" basado en un segmented control.
            </TabsContent>
            <TabsContent value="tab3" className="p-4 bg-surface-container mt-4 rounded-sm text-sm text-on-surface-variant">
              Contenido de la tercera pestaña. Sin bordes inferiores rígidos, usando contenedores redondeados.
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="font-headline text-2xl font-bold uppercase tracking-tight mb-6 border-b border-surface-container-highest pb-2">7. Filters / Toggles (FilterGroup)</h2>
        <div className="bg-surface-container-low p-10 rounded-lg max-w-3xl">
          <FilterGroup value={filterValue} onValueChange={setFilterValue}>
            <FilterItem value="all">Todas</FilterItem>
            <FilterItem value="f1">Formula 1</FilterItem>
            <FilterItem value="wec">WEC</FilterItem>
            <FilterItem value="wrc">WRC</FilterItem>
          </FilterGroup>
          <p className="mt-4 text-sm text-on-surface-variant">Componente ideal para filtrado de listas y categorías. Mantiene un diseño fluido usando fondos para denotar el estado de activación en lugar de bordes inferiores.</p>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="font-headline text-2xl font-bold uppercase tracking-tight mb-6 border-b border-surface-container-highest pb-2">8. Typography Specs</h2>
        <div className="bg-surface-container-low p-10 rounded-lg flex flex-col gap-6">
          <div>
            <span className="text-xs text-on-surface-variant font-label uppercase">Headline Large (Space Grotesk)</span>
            <h1 className="font-headline text-4xl md:text-6xl font-bold uppercase tracking-tighter">The Quick Brown Fox</h1>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant font-label uppercase">Headline Medium (Space Grotesk)</span>
            <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">The Quick Brown Fox</h2>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant font-label uppercase">Body (Inter)</span>
            <p className="font-body text-base text-on-surface-variant">The quick brown fox jumps over the lazy dog. This is the standard paragraph text.</p>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant font-label uppercase">Label/Overline (Inter / Space Grotesk)</span>
            <p className="font-label text-xs uppercase tracking-widest text-primary-dim font-bold">The quick brown fox</p>
          </div>
        </div>
      </section>
    </div>
  );
}
