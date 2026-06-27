import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, FlatList } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, estadoColors, estadoLabel } from '../data/theme';

var ESTADOS = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'En proceso', value: 'en_proceso' },
  { label: 'Confirmado', value: 'confirmado' },
  { label: 'Cerrado', value: 'cerrado' },
];

export default function HomeFacilitador(props) {
  var onSelectPedido = props.onSelectPedido;
  var onLogout = props.onLogout;
  var app = useApp();

  var estadoState = useState('todos'); var filtroEstado = estadoState[0]; var setFiltroEstado = estadoState[1];
  var solState = useState('todos'); var filtroSol = solState[0]; var setFiltroSol = solState[1];
  var pickerState = useState(false); var showPicker = pickerState[0]; var setShowPicker = pickerState[1];

  var pedidos = app.pedidos;

  var solicitantes = [];
  var seen = {};
  for (var i = 0; i < pedidos.length; i++) {
    var p = pedidos[i];
    if (!seen[p.solicitanteId]) {
      seen[p.solicitanteId] = true;
      solicitantes.push({ id: p.solicitanteId, nombre: p.solicitanteNombre });
    }
  }

  var pedidosFiltrados = pedidos.filter(function(p) {
    var matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado;
    var matchSol = filtroSol === 'todos' || p.solicitanteId === filtroSol;
    return matchEstado && matchSol;
  });

  var total = pedidos.length;
  var pendientes = pedidos.filter(function(p) { return p.estado === 'pendiente'; }).length;
  var activos = pedidos.filter(function(p) { return p.estado === 'en_proceso' || p.estado === 'confirmado'; }).length;
  var cerrados = pedidos.filter(function(p) { return p.estado === 'cerrado'; }).length;

  var solNombre = filtroSol === 'todos' ? 'Todos los solicitantes' : (solicitantes.find(function(s) { return s.id === filtroSol; }) || {}).nombre || 'Todos';

  function handleExport() {
    Alert.alert('Exportar Excel', 'Se generaron ' + pedidos.length + ' registros. Esta funcion descargara el archivo .xlsx en la version final.');
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View>
          <Text style={s.appName}>🏗️ GruasApp</Text>
          <Text style={s.userName}>{app.currentUser.name}</Text>
        </View>
        <View style={s.headerRight}>
          <View style={s.rolePill}><Text style={s.roleText}>🔧 Facilitador</Text></View>
          <TouchableOpacity style={s.logoutBtn} onPress={onLogout}>
            <Text style={s.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <View style={s.statsGrid}>
          <StatBox label="Total" value={total} />
          <StatBox label="Sin asignar" value={pendientes} color={colors.warn} />
          <StatBox label="En gestion" value={activos} color={colors.info} />
          <StatBox label="Cerrados" value={cerrados} color={colors.success} />
        </View>

        <TouchableOpacity style={s.exportBtn} onPress={handleExport}>
          <Text style={s.exportText}>⬇  Exportar todos los pedidos a Excel</Text>
        </TouchableOpacity>

        <Text style={s.sectionTitle}>Filtros</Text>
        <View style={s.filtersCard}>
          <Text style={s.filterLabel}>Por estado</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {ESTADOS.map(function(e) {
              var active = filtroEstado === e.value;
              var ec = e.value !== 'todos' ? estadoColors(e.value) : null;
              return (
                <TouchableOpacity
                  key={e.value}
                  style={[s.chip, active && (ec ? { backgroundColor: ec.bg, borderColor: ec.border } : s.chipActive)]}
                  onPress={function() { setFiltroEstado(e.value); }}
                >
                  <Text style={[s.chipText, active && (ec ? { color: ec.text } : s.chipTextActive)]}>{e.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[s.filterLabel, { marginTop: 12 }]}>Por solicitante</Text>
          <TouchableOpacity style={s.solPicker} onPress={function() { setShowPicker(true); }}>
            <Text style={s.solPickerText}>👷 {solNombre}</Text>
            <Text style={s.solPickerArrow}>▾</Text>
          </TouchableOpacity>
        </View>

        <View style={s.listHeader}>
          <Text style={s.sectionTitle}>Pedidos ({pedidosFiltrados.length}{pedidosFiltrados.length !== pedidos.length ? ' de ' + pedidos.length : ''})</Text>
          {(filtroEstado !== 'todos' || filtroSol !== 'todos') && (
            <TouchableOpacity onPress={function() { setFiltroEstado('todos'); setFiltroSol('todos'); }}>
              <Text style={s.clearFilter}>Limpiar filtros</Text>
            </TouchableOpacity>
          )}
        </View>

        {pedidosFiltrados.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🔍</Text>
            <Text style={s.emptyTitle}>Sin resultados</Text>
            <Text style={s.emptySub}>No hay pedidos con esos filtros.</Text>
          </View>
        ) : (
          pedidosFiltrados.map(function(p) {
            var ec = estadoColors(p.estado);
            var sinAsignar = !p.facilitadorId;
            return (
              <TouchableOpacity key={p.id} style={[s.card, sinAsignar && s.cardUrgent]} onPress={function() { onSelectPedido(p.id); }}>
                <View style={s.cardHeader}>
                  <View>
                    <Text style={s.pedidoId}>{p.id}</Text>
                    <Text style={s.solNombre}>{p.solicitanteNombre}</Text>
                    <Text style={s.pedidoFecha}>{p.fechaSolicitud}</Text>
                  </View>
                  <View style={[s.badge, { backgroundColor: ec.bg, borderColor: ec.border }]}>
                    <Text style={[s.badgeText, { color: ec.text }]}>{estadoLabel(p.estado)}</Text>
                  </View>
                </View>
                <View style={s.chipRow}>
                  <View style={s.infoChip}><Text style={s.infoChipText}>🏋️ {p.capacidad}t</Text></View>
                  <View style={s.infoChip}><Text style={s.infoChipText}>📅 {p.dias} dia{p.dias > 1 ? 's' : ''}</Text></View>
                  {p.empresa ? <View style={s.infoChip}><Text style={s.infoChipText}>🏢 {p.empresa}</Text></View> : null}
                </View>
                {sinAsignar && p.estado === 'pendiente' ? (
                  <View style={s.urgentBanner}><Text style={s.urgentText}>⚡ Sin facilitador asignado</Text></View>
                ) : null}
                {p.facilitadorNombre ? <Text style={s.facText}>Facilitador: {p.facilitadorNombre}</Text> : null}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Modal visible={showPicker} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Filtrar por solicitante</Text>
            <FlatList
              data={[{ id: 'todos', nombre: 'Todos los solicitantes' }].concat(solicitantes)}
              keyExtractor={function(item) { return item.id; }}
              renderItem={function(info) {
                var item = info.item;
                return (
                  <TouchableOpacity style={[s.solItem, filtroSol === item.id && s.solItemSel]} onPress={function() { setFiltroSol(item.id); setShowPicker(false); }}>
                    <Text style={[s.solItemText, filtroSol === item.id && s.solItemTextSel]}>
                      {item.id === 'todos' ? '👥 ' : '👷 '}{item.nombre}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity style={s.cancelBtn} onPress={function() { setShowPicker(false); }}>
              <Text style={s.cancelText}>Cancelar</Text>
            </TouchableOpacity>
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
  box: { flex: 1, backgroundColor: colors.bgCard, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  num: { fontSize: 20, fontWeight: '700' },
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
  scrollContent: { padding: 16, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  exportBtn: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.accent, borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 16 },
  exportText: { color: colors.accent, fontWeight: '600', fontSize: 13 },
  sectionTitle: { fontSize: 11, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  filtersCard: { backgroundColor: colors.bgCard, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  filterLabel: { fontSize: 11, color: colors.textSub, fontWeight: '500', marginBottom: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.border, marginRight: 8, backgroundColor: colors.bg },
  chipActive: { backgroundColor: colors.accentLight, borderColor: colors.accent },
  chipText: { fontSize: 12, color: colors.textSub, fontWeight: '500' },
  chipTextActive: { color: colors.accent },
  solPicker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10 },
  solPickerText: { fontSize: 13, color: colors.text },
  solPickerArrow: { color: colors.textMuted },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  clearFilter: { fontSize: 12, color: colors.accent, fontWeight: '500' },
  card: { backgroundColor: colors.bgCard, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  cardUrgent: { borderColor: colors.warnBorder },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  pedidoId: { fontSize: 14, fontWeight: '600', color: colors.text },
  solNombre: { fontSize: 13, color: colors.accent, fontWeight: '500', marginTop: 1 },
  pedidoFecha: { fontSize: 11, color: colors.textSub, marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  infoChip: { backgroundColor: colors.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: colors.border },
  infoChipText: { fontSize: 12, color: colors.textSub },
  urgentBanner: { marginTop: 8, backgroundColor: colors.warnBg, borderRadius: 8, padding: 7, borderWidth: 1, borderColor: colors.warnBorder },
  urgentText: { fontSize: 12, color: colors.warn, fontWeight: '500' },
  facText: { fontSize: 12, color: colors.textSub, marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 4 },
  emptySub: { fontSize: 13, color: colors.textSub, textAlign: 'center', paddingHorizontal: 20 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colors.bgCard, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '60%' },
  modalTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 14 },
  solItem: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  solItemSel: { backgroundColor: colors.accentLight, marginHorizontal: -4, paddingHorizontal: 4, borderRadius: 8 },
  solItemText: { fontSize: 14, color: colors.text },
  solItemTextSel: { color: colors.accent, fontWeight: '600' },
  cancelBtn: { marginTop: 14, padding: 13, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10 },
  cancelText: { color: colors.textSub, fontWeight: '500' },
});
