export const DISCIPLESHIP_PHASES_META = [
  {
    key: 'contacto' as const,
    name: 'Contacto & Bienvenida',
    subtitle: 'Nuevos creyentes y visitas',
    color: 'blue',
    description: 'Etapa inicial de acogida, recolección de datos y primer contacto pastoral.',
    targetDurationWeeks: 4,
    requiredSessions: 4
  },
  {
    key: 'consolidacion' as const,
    name: 'Consolidación',
    subtitle: 'Afianzamiento de la fe',
    color: 'indigo',
    description: 'Fundamentos cristianos, integración regular al grupo misionero y bautismo.',
    targetDurationWeeks: 8,
    requiredSessions: 8
  },
  {
    key: 'formacion' as const,
    name: 'Formación & Escuela',
    subtitle: 'Capacitación bíblica',
    color: 'purple',
    description: 'Escuela de líderes, doctrina ministerial y mayordomía integral.',
    targetDurationWeeks: 16,
    requiredSessions: 16
  },
  {
    key: 'liderazgo' as const,
    name: 'Liderazgo & Envío',
    subtitle: 'Multiplicación misionera',
    color: 'emerald',
    description: 'Apertura de nuevos grupos, mentoría de otros discípulos y servicio activo.',
    targetDurationWeeks: 24,
    requiredSessions: 24
  }
];
