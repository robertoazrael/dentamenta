export interface DentamentaPromotion {
  monthIndex: number;
  monthName: string;
  title: string;
  description: string;
}

export const dentamentaPromotions: DentamentaPromotion[] = [
  {
    monthIndex: 0,
    monthName: 'Enero',
    title: 'Propósito de sonrisa nueva',
    description: '10% de descuento en limpieza dental y valoración inicial para pacientes de primera vez.',
  },
  {
    monthIndex: 1,
    monthName: 'Febrero',
    title: 'Mes de la sonrisa compartida',
    description: 'Limpieza dental con precio preferente para parejas o familiares que agenden juntos.',
  },
  {
    monthIndex: 2,
    monthName: 'Marzo',
    title: 'Regreso a la rutina',
    description: 'Paquete de valoración inicial + limpieza con precio especial.',
  },
  {
    monthIndex: 3,
    monthName: 'Abril',
    title: 'Mes de niñas y niños',
    description: 'Consulta infantil preventiva con orientación para papás y descuento en limpieza infantil.',
  },
  {
    monthIndex: 4,
    monthName: 'Mayo',
    title: 'Sonrisas para mamá',
    description: 'Promoción especial en limpieza dental y valoración estética para mamás.',
  },
  {
    monthIndex: 5,
    monthName: 'Junio',
    title: 'Mitad de año, sonrisa al día',
    description: 'Revisión general + limpieza con precio preferente.',
  },
  {
    monthIndex: 6,
    monthName: 'Julio',
    title: 'Verano sin pendientes',
    description: 'Promoción en valoración inicial para estudiantes y familias.',
  },
  {
    monthIndex: 7,
    monthName: 'Agosto',
    title: 'Regreso a clases',
    description: 'Consulta preventiva infantil y limpieza dental con precio especial.',
  },
  {
    monthIndex: 8,
    monthName: 'Septiembre',
    title: 'Mes patrio, sonrisa sana',
    description: 'Descuento en limpieza dental y revisión general.',
  },
  {
    monthIndex: 9,
    monthName: 'Octubre',
    title: 'Prevención antes de fin de año',
    description: 'Valoración inicial con precio preferente para tratamientos pendientes.',
  },
  {
    monthIndex: 10,
    monthName: 'Noviembre',
    title: 'Buen Fin Dental',
    description: 'Promociones limitadas en limpieza, blanqueamiento y valoración estética.',
  },
  {
    monthIndex: 11,
    monthName: 'Diciembre',
    title: 'Sonrisa de Navidad',
    description: 'Promoción en limpieza dental y certificado simbólico de sonrisa lista para las fiestas.',
  },
];

export const birthdayPromotion = {
  title: 'Promoción de cumpleaños',
  description: 'Durante el mes de cumpleaños, limpieza dental con precio especial para pacientes de primera vez, sujeta a disponibilidad y valoración.',
};

export function getPromotionForMonth(monthIndex: number): DentamentaPromotion {
  return dentamentaPromotions[monthIndex] ?? dentamentaPromotions[0];
}

export function getCurrentDentamentaPromotion(date = new Date()): DentamentaPromotion {
  return getPromotionForMonth(date.getMonth());
}

export function getNextDentamentaPromotion(date = new Date()): DentamentaPromotion {
  return getPromotionForMonth((date.getMonth() + 1) % 12);
}
