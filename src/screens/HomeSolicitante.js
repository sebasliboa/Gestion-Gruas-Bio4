import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, estadoColors, estadoLabel } from '../data/theme';

export default function HomeSolicitante(props) {
  var onSelectPedido = props.onSelectPedido;
  var onLogout = props.onLogout;
  var app = useApp();

  var modalState = useState(false); var showModal = modalState[0]; var setShowModal = modalState[1];
  var capState = useState(''); var capInput = capState[0]; var setCapInput = capState[1];
  var diasState = useState(''); var diasInput = diasState[0]; var setDiasInput = diasState[1];

  var misPedidos = app.pedidos.filter(function(p) { return p.solicitanteId === app.currentUser.id; });

  var total = misPedidos.length;
  var pendientes = misPedidos.filter(function(p) { return p.estado === 'pendiente'; }).length;
  var activos = misPedidos.filter(function(p) { return p.estado === 'en_proceso' || p.estado === 'confirmado'; }).length;
  var cerrados = misPedidos.filter(function(p) { return p.estado === 'cerrado'; }).length;

  function needsClosure(p) { return p.estado === 'confirmado' && !p.horasUso; }

  function handleCrear() {
    var cap = parseInt(capInput);
    var dias = parseInt(diasInput);
    if (!cap || cap <= 0 || !dias || dias <= 0) {
      Alert.alert('Valores invalidos', 'Ingresa valores validos de capacidad y dias.');
      return;
    }
    app.crearPedido(cap, dias);
    setCapInput(''); setDiasInput('');
    setShowModal(false);
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View>
          <Text style={s.appName}>🏗️ GruasApp</Text>
          <Text style={s.userName}>{app.currentUser.name}</Text>
        </View>
        <View style={s.headerRight}>
          <View style={s.rolePill}><Text style={s.roleText}>👷 Solicitante</Text></View>
          <TouchableOpacity style={s.logoutBtn} onPress={onLogout}>
            <Text style={s.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <View style={s.statsGrid}>
          <StatBox label="Mis pedidos" value={total} />
          <StatBox label="Pendientes" value={pendientes} color={colors.warn} />
          <StatBox label="En gestion" value={activos} color={colors.info} />
          <StatBox label="Cerrados" value={cerrados} color={colors.success} />
        </View>

        {misPedidos.some(needsClosure) && (
          <View style={s.alertBanner}>
            <Text style={s.alertText}>⚠️ Tenes pedidos confirmados pendientes de cierre.</Text>
          </View>
        )}

        <Text style={s.sectionTitle}>Mis pedidos</Text>

        {misPedidos.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📋</Text>
            <Text style={s.emptyTitle}>Sin pedidos todavia</Text>
            <Text style={s.emptySub}>Toca el boton para crear tu primer pedido.</Text>
          </View>
        ) : (
          misPedidos.map(function(p) {
            var ec = estadoColors(p.estado);
            var cierre = needsClosure(p);
            return (
              <TouchableOpacity key={p.id} style={[s.card, cierre && s.cardHighlight]} onPress={function() { onSelectPedido(p.id); }}>
                <View style={s.cardHeader}>
                  <View>
                    <Text style={s.pedidoId}>{p.id}</Text>
                    <Text style={s.pedidoFecha}>{p.fechaSolicitud}</Text>
                  </View>
                  <View style={[s.badge, { backgroundColor: ec.bg, borderColor: ec.border }]}>
                    <Text style={[s.badgeText, { color: ec.text }]}>{estadoLabel(p.estado)}</Text>
                  </View>
                </View>
                <View style={s.chipRow}>
                  <View style={s.chip}><Text style={s.chipText}>🏋️ {p.capacidad}t</Text></View>
                  <View style={s.chip}><Text style={s.chipText}>📅 {p.dias} dia{p.dias > 1 ? 's' : ''}</Text></View>
                  {p.empresa ? <View style={s.chip}><Text style={s.chipText}>🏢 {p.empresa}</Text></View> : null}
                </View>
                {p.facilitadorNombre ? <Text style={s.facText}>Gestionado por: {p.facilitadorNombre}</Text> : null}
                {cierre ? (
                  <View style={s.cierreBanner}>
                    <Text style={s.cierreText}>📝 Pendiente de cierre - completa los datos finales</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={function() { setShowModal(true); }}>
        <Text style={s.fabText}>+ Nuevo pedido</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Nuevo pedido de grua</Text>
            <Text style={s.modalLabel}>Capacidad de grua (toneladas)</Text>
            <TextInput style={s.modalInput} keyboardType="numeric" placeholder="Ej: 50" placeholderTextColor={colors.textMuted} value={capInput} onChangeText={setCapInput} />
            <Text style={[s.modalLabel, { marginTop: 14 }]}>Cantidad de dias de uso</Text>
            <TextInput style={s.modalInput} keyboardType="numeric" placeholder="Ej: 3" placeholderTextColor={colors.textMuted} value={diasInput} onChangeText={setDiasInput} />
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.btnCancel} onPress={function() { setShowModal(false); }}>
                <Text style={s.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.btnCreate} onPress={handleCrear}>
                <Text style={s.btnCreateText}>Crear pedido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StatBox(props) {
  var label = props.label; var value = props.value; var color = props.color || colors.text;
  return (
    <View style={ss.box}>
      <Text style={[ss.num, { color: color }]}>{value}</Text>
      <Text style={ss.lbl}>{label}</Text>
    </View>
  );
}
var ss = StyleSheet.create({
  box: { flex: 1, backgroundColor: colors.bgCard, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  num: { fontSize: 22, fontWeight: '700' },
  lbl: { fontSize: 10, color: colors.textSub, marginTop: 2, textAlign: 'center' },
});

var s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 52, backgroundColor: colors.bgHeader },
  appName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  userName: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rolePill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  roleText: { fontSize: 11, color: '#fff', fontWeight: '500' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  logoutText: { fontSize: 12, color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  alertBanner: { backgroundColor: colors.warnBg, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.warnBorder, marginBottom: 14 },
  alertText: { fontSize: 13, color: colors.warn, fontWeight: '500' },
  sectionTitle: { fontSize: 11, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  card: { backgroundColor: colors.bgCard, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  cardHighlight: { borderColor: colors.warnBorder, borderWidth: 1.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  pedidoId: { fontSize: 15, fontWeight: '600', color: colors.text },
  pedidoFecha: { fontSize: 12, color: colors.textSub, marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  chip: { backgroundColor: colors.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: colors.border },
  chipText: { fontSize: 12, color: colors.textSub },
  facText: { fontSize: 12, color: colors.textSub, marginTop: 2 },
  cierreBanner: { marginTop: 8, backgroundColor: colors.infoBg, borderRadius: 8, padding: 8, borderWidth: 1, borderColor: colors.infoBorder },
  cierreText: { fontSize: 12, color: colors.info, fontWeight: '500' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 6 },
  emptySub: { fontSize: 13, color: colors.textSub, textAlign: 'center', paddingHorizontal: 20 },
  fab: { position: 'absolute', bottom: 24, left: 16, right: 16, backgroundColor: colors.accent, borderRadius: 14, padding: 16, alignItems: 'center' },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colors.bgCard, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border },
  modalTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 18 },
  modalLabel: { fontSize: 12, color: colors.textSub, marginBottom: 6, fontWeight: '500' },
  modalInput: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.text, fontSize: 15 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btnCancel: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 13, alignItems: 'center' },
  btnCancelText: { color: colors.textSub, fontWeight: '600' },
  btnCreate: { flex: 1, backgroundColor: colors.accent, borderRadius: 10, padding: 13, alignItems: 'center' },
  btnCreateText: { color: '#fff', fontWeight: '700' },
});
