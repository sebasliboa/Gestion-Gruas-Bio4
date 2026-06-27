export const colors = {
  bg: '#F0F4F8',
  bgCard: '#FFFFFF',
  bgInput: '#F8FAFC',
  bgHeader: '#1A56A0',
  border: '#D1DCE8',
  borderLight: '#E8EFF5',
  accent: '#1A56A0',
  accentLight: '#EBF2FB',
  text: '#1A2536',
  textSub: '#4A6080',
  textMuted: '#8FA8C0',
  success: '#0A7C5C',
  successBg: '#E6F5F0',
  successBorder: '#A8DDD0',
  warn: '#B45309',
  warnBg: '#FEF3C7',
  warnBorder: '#FCD34D',
  info: '#1A56A0',
  infoBg: '#EBF2FB',
  infoBorder: '#93C5FD',
  estadoPendienteBg: '#FEF3C7',
  estadoPendiente: '#92400E',
  estadoEnProcesoBg: '#DBEAFE',
  estadoEnProceso: '#1E40AF',
  estadoConfirmadoBg: '#D1FAE5',
  estadoConfirmado: '#065F46',
  estadoCerradoBg: '#F1F5F9',
  estadoCerrado: '#475569',
};

export function estadoColors(estado) {
  switch (estado) {
    case 'pendiente':  return { bg: colors.estadoPendienteBg,  text: colors.estadoPendiente,  border: colors.warnBorder };
    case 'en_proceso': return { bg: colors.estadoEnProcesoBg,  text: colors.estadoEnProceso,  border: colors.infoBorder };
    case 'confirmado': return { bg: colors.estadoConfirmadoBg, text: colors.estadoConfirmado, border: colors.successBorder };
    case 'cerrado':    return { bg: colors.estadoCerradoBg,    text: colors.estadoCerrado,    border: colors.border };
    default:           return { bg: colors.bgCard,             text: colors.textSub,          border: colors.border };
  }
}

export function estadoLabel(estado) {
  var map = {
    pendiente: 'Pendiente',
    en_proceso: 'En proceso',
    confirmado: 'Confirmado',
    cerrado: 'Cerrado',
  };
  return map[estado] || estado;
}

export var AREAS = [
  'Operaciones',
  'Mantenimiento',
  'Ingenieria',
  'Seguridad',
  'Logistica',
  'Administracion',
  'Recursos Humanos',
  'Compras',
];
