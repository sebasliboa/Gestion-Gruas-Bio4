var EMAILJS_SERVICE_ID    = 'service_qchpn9l';
var EMAILJS_PUBLIC_KEY    = 'k_nGlB_2mQ9PJEmnc';
var TEMPLATE_BIENVENIDA   = 'Template_ct1o41u';
var TEMPLATE_CONFIRMACION = 'template_3xngaa3';
var TEMPLATE_NUEVO_PEDIDO = 'template_3xngaa3';

var EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send';

function sendEmail(templateId, params) {
  return fetch(EMAILJS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: params,
    }),
  }).then(function(r) { return r.ok; }).catch(function(e) { console.warn('Email error:', e); return false; });
}

export function enviarEmailBienvenida(user) {
  return sendEmail(TEMPLATE_BIENVENIDA, {
    to_name:  user.name,
    to_email: user.email,
    area:     user.area,
    legajo:   user.legajo,
  });
}

export function enviarEmailConfirmacion(params) {
  return sendEmail(TEMPLATE_CONFIRMACION, {
    to_name:     params.toName,
    to_email:    params.toEmail,
    pedido_id:   params.pedidoId,
    empresa:     params.empresa,
    capacidad:   String(params.capacidad),
    dias:        String(params.dias),
    facilitador: params.facilitadorNombre,
  });
}

export function enviarEmailNuevoPedido(params) {
  return sendEmail(TEMPLATE_NUEVO_PEDIDO, {
    to_name:      'Equipo Compras',
    to_email:     params.facilitadoresEmails,
    pedido_id:    params.pedidoId,
    solicitante:  params.solicitanteNombre,
    capacidad:    String(params.capacidad),
    dias:         String(params.dias),
    fecha:        params.fecha,
  });
}
