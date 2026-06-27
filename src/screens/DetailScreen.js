import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, estadoColors, estadoLabel } from '../data/theme';

export default function DetailScreen(props) {
  var pedidoId = props.pedidoId;
  var onBack = props.onBack;
  var app = useApp();

  var p = null;
  for (var i = 0; i < app.pedidos.length; i++) {
    if (app.pedidos[i].id === pedidoId) { p = app.pedidos[i]; break; }
  }

  var empresaState = useState(p ? (p.empresa || '') : ''); var empresa = empresaState[0]; var setEmpresa = empresaState[1];
  var horasState = useState(''); var horas = horasState[0]; var setHoras = horasState[1];
  var costoState = useState(''); var costo = costoState[0]; var setCosto = costoState[1];
  var remitoState = useState(''); var remito = remitoState[0]; var setRemito = remitoState[1];
  var loadingState = useState(false); var loading = loadingState[0]; var setLoading = loadingState[1];

  if (!p || !app.currentUser) return null;

  var isFac = app.currentUser.role === 'facilitador';
  var isMySol = app.currentUser.role === 'solicitante' && p.solicitanteId === app.currentUser.id;
  var closed = p.estado === 'cerrado';
  var ec = estadoColors(p.estado);

  var steps = [
    { label: 'Pedido creado', sub: p.solicitanteNombre + ' · ' + p.fechaSolicitud, done: true },
    { label: 'Facilitador asignado', sub: p.facilitadorNombre || 'Esperando asignacion...', done: !!p.facilitadorId },
    { label: 'Empresa contratada', sub: p.empresa || 'Pendiente...', done: !!p.empresa && (p.estado === 'confirmado' || p.estado === 'cerrado') },
    { label: 'Trabajo ejecutado', sub: closed ? (p.horasUso + 'h · CC: ' + p.centroCostos + ' · Remito: ' + p.nroRemito) : 'Pendiente...', done: closed },
  ];

  function handleAsignar() {
    Alert.alert('Asignarse pedido', 'Queres asignarte al pedido ' + p.id + '?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: function() { app.asignarFacilitador(p.id); } },
    ]);
  }

  function handleSetEstado(estado) {
    if (estado === 'confirmado' && !empresa.trim()) {
      Alert.alert('Empresa requerida', 'Ingresa el nombre de la empresa antes de confirmar.');
      return;
    }
    setLoading(true);
    app.setEstado(p.id, estado, empresa);
    setLoading(false);
    if (estado === 'confirmado') {
      Alert.alert('Confirmado', 'El pedido fue confirmado y se envio un correo al solicitante.');
    }
  }

  function handleCerrar() {
    var h = parseFloat(horas);
    if (!h || h <= 0 || !costo.trim() || !remito.trim()) {
      Alert.alert('Campos requeridos', 'Completa horas de uso, centro de costos y nro. de remito.');
      return;
    }
    Alert.alert('Cerrar pedido', 'Confirmas el cierre del pedido?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar', style: 'destructive', onPress: function() { app.cerrarPedido(p.id, h, costo.trim(), remito.trim()); onBack(); } },
    ]);
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={s.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{p.id}</Text>
        <View style={[s.badge, { backgroundColor: ec.bg, borderColor: ec.border }]}>
          <Text style={[s.badgeText, { color: ec.text }]}>{estadoLabel(p.estado)}</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <Text style={s.sectionTitle}>Progreso</Text>
        <View style={s.card}>
          {steps.map(function(step, i) {
            var isActive = !step.done;
            for (var j = 0; j < i; j++) { if (!steps[j].done) { isActive = false; break; } }
            return (
              <View key={i} style={[s.step, i < steps.length - 1 && s.stepBorder]}>
                <View style={[s.dot, step.done ? s.dotDone : isActive ? s.dotActive : s.dotTodo]} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.stepLabel, !step.done && !isActive && { color: colors.textMuted }]}>{step.label}</Text>
                  <Text style={s.stepSub}>{step.sub}</Text>
                </View>
                {step.done ? <Text style={s.check}>✓</Text> : null}
              </View>
            );
          })}
        </View>

        <Text style={s.sectionTitle}>Datos del pedido</Text>
        <View style={s.card}>
          <Row label="Solicitante" value={p.solicitanteNombre} />
          <Row label="Correo" value={p.solicitanteEmail} />
          <Row label="Fecha" value={p.fechaSolicitud} />
          <Row label="Capacidad" value={p.capacidad + ' toneladas'} />
          <Row label="Dias de uso" value={p.dias + ' dia' + (p.dias > 1 ? 's' : '')} />
          {p.facilitadorNombre ? <Row label="Facilitador" value={p.facilitadorNombre} /> : null}
          {p.empresa ? <Row label="Empresa" value={p.empresa} /> : null}
          {closed ? (
            <View>
              <View style={s.divider} />
              <Row label="Horas de uso" value={p.horasUso + 'h'} />
              <Row label="Centro de costos" value={p.centroCostos} />
              <Row label="Nro. de remito" value={p.nroRemito} />
            </View>
          ) : null}
        </View>

        {isFac && !closed ? (
          <View>
            <Text style={s.sectionTitle}>Gestion del facilitador</Text>
            <View style={s.card}>
              {!p.facilitadorId ? (
                <TouchableOpacity style={s.btnPrimary} onPress={handleAsignar}>
                  <Text style={s.btnPrimaryText}>Asignarme este pedido</Text>
                </TouchableOpacity>
              ) : null}
              <Text style={[s.fieldLabel, { marginTop: p.facilitadorId ? 0 : 14 }]}>Empresa contratada</Text>
              <TextInput style={s.input} placeholder="Nombre de la empresa" placeholderTextColor={colors.textMuted} value={empresa} onChangeText={setEmpresa} />
              <View style={s.btnRow}>
                <TouchableOpacity style={[s.btnSecondary, { flex: 1 }]} onPress={function() { handleSetEstado('en_proceso'); }} disabled={loading}>
                  <Text style={s.btnSecondaryText}>En proceso</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.btnSuccess, { flex: 1 }]} onPress={function() { handleSetEstado('confirmado'); }} disabled={loading}>
                  <Text style={s.btnSuccessText}>{loading ? 'Enviando...' : 'Confirmar'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        {isMySol && p.estado === 'confirmado' && !p.horasUso ? (
          <View>
            <Text style={s.sectionTitle}>Cierre del trabajo</Text>
            <View style={[s.alertBox, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
              <Text style={[s.alertBoxText, { color: colors.success }]}>Grua confirmada. Completa los datos finales.</Text>
            </View>
            <View style={s.card}>
              <Text style={s.fieldLabel}>Horas de uso efectivo</Text>
              <TextInput style={s.input} keyboardType="decimal-pad" placeholder="Ej: 8.5" placeholderTextColor={colors.textMuted} value={horas} onChangeText={setHoras} />
              <Text style={[s.fieldLabel, { marginTop: 12 }]}>Centro de costos</Text>
              <TextInput style={s.input} placeholder="Ej: CC-1042" placeholderTextColor={colors.textMuted} value={costo} onChangeText={setCosto} />
              <Text style={[s.fieldLabel, { marginTop: 12 }]}>Nro. de remito</Text>
              <TextInput style={s.input} placeholder="Ej: R-00451" placeholderTextColor={colors.textMuted} value={remito} onChangeText={setRemito} />
              <TouchableOpacity style={[s.btnSuccess, { marginTop: 16 }]} onPress={handleCerrar}>
                <Text style={s.btnSuccessText}>Cerrar pedido</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {isMySol && closed ? (
          <View style={[s.alertBox, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
            <Text style={[s.alertBoxText, { color: colors.success }]}>Pedido cerrado correctamente.</Text>
          </View>
        ) : null}

        {isFac && closed ? (
          <View>
            <Text style={s.sectionTitle}>Edicion (solo facilitadores)</Text>
            <View style={[s.alertBox, { backgroundColor: colors.warnBg, borderColor: colors.warnBorder }]}>
              <Text style={[s.alertBoxText, { color: colors.warn }]}>Pedido cerrado. Solo facilitadores pueden editarlo.</Text>
            </View>
            <View style={s.card}>
              <Text style={s.fieldLabel}>Empresa</Text>
              <TextInput style={s.input} placeholder="Empresa" placeholderTextColor={colors.textMuted} value={empresa} onChangeText={setEmpresa} />
              <TouchableOpacity style={[s.btnPrimary, { marginTop: 12 }]} onPress={function() { app.actualizarPedido(p.id, { empresa: empresa }); Alert.alert('Guardado', 'Pedido actualizado.'); }}>
                <Text style={s.btnPrimaryText}>Guardar cambios</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Row(props) {
  return (
    <View style={rs.row}>
      <Text style={rs.label}>{props.label}</Text>
      <Text style={rs.value} numberOfLines={1}>{props.value}</Text>
    </View>
  );
}
var rs = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  label: { fontSize: 13, color: colors.textSub, flex: 1 },
  value: { fontSize: 13, color: colors.text, fontWeight: '500', flex: 2, textAlign: 'right' },
});

var s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 52, backgroundColor: colors.bgHeader },
  backText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 11, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 4 },
  card: { backgroundColor: colors.bgCard, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10 },
  stepBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  dotDone: { backgroundColor: colors.success },
  dotActive: { backgroundColor: colors.info },
  dotTodo: { backgroundColor: colors.border },
  stepLabel: { fontSize: 13, fontWeight: '500', color: colors.text },
  stepSub: { fontSize: 12, color: colors.textSub, marginTop: 1 },
  check: { color: colors.success, fontWeight: '700', fontSize: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border, marginVertical: 8 },
  fieldLabel: { fontSize: 12, color: colors.textSub, marginBottom: 6, fontWeight: '500' },
  input: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.text, fontSize: 15 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  alertBox: { borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1 },
  alertBoxText: { fontSize: 13, fontWeight: '500' },
  btnPrimary: { backgroundColor: colors.accent, borderRadius: 10, padding: 13, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnSecondary: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 13, alignItems: 'center' },
  btnSecondaryText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  btnSuccess: { backgroundColor: colors.success, borderRadius: 10, padding: 13, alignItems: 'center' },
  btnSuccessText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
