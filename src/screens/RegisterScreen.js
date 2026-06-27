import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, AREAS } from '../data/theme';

export default function RegisterScreen(props) {
  var onBack = props.onBack;
  var onRegistered = props.onRegistered;
  var app = useApp();

  var nameState = useState(''); var name = nameState[0]; var setName = nameState[1];
  var emailState = useState(''); var email = emailState[0]; var setEmail = emailState[1];
  var passState = useState(''); var password = passState[0]; var setPassword = passState[1];
  var confirmState = useState(''); var confirmPass = confirmState[0]; var setConfirmPass = confirmState[1];
  var areaState = useState(''); var area = areaState[0]; var setArea = areaState[1];
  var legajoState = useState(''); var legajo = legajoState[0]; var setLegajo = legajoState[1];
  var showPassState = useState(false); var showPass = showPassState[0]; var setShowPass = showPassState[1];
  var showPickerState = useState(false); var showPicker = showPickerState[0]; var setShowPicker = showPickerState[1];
  var loadingState = useState(false); var loading = loadingState[0]; var setLoading = loadingState[1];

  var roleForArea = area === 'Compras' ? 'Facilitador (Compras)' : area ? 'Solicitante' : '';

  function handleRegister() {
    if (!name.trim() || !email.trim() || !password || !area || !legajo.trim()) {
      Alert.alert('Campos requeridos', 'Completa todos los campos.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Correo invalido', 'Ingresa un correo electronico valido.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contrasena muy corta', 'Minimo 6 caracteres.');
      return;
    }
    if (password !== confirmPass) {
      Alert.alert('Las contrasenas no coinciden', 'Verifica que sean iguales.');
      return;
    }
    setLoading(true);
    setTimeout(function() {
      var result = app.register({ email: email.trim(), password: password, name: name.trim(), area: area, legajo: legajo.trim() });
      setLoading(false);
      if (result === 'already_exists') {
        Alert.alert('Ya existe una cuenta', 'Ya hay un usuario con ese correo.');
      } else {
        Alert.alert('Registro exitoso!', 'Tu cuenta fue creada. Te enviamos un correo de bienvenida a ' + email.trim() + '.', [{ text: 'Iniciar sesion', onPress: onRegistered }]);
      }
    }, 400);
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={s.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Crear cuenta</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <Text style={s.label}>Nombre completo</Text>
          <TextInput style={s.input} placeholder="Ej: Juan Garcia" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />

          <Text style={[s.label, s.mt]}>Correo electronico</Text>
          <Text style={s.hint}>Se recomienda usar el correo de la empresa</Text>
          <TextInput style={s.input} placeholder="usuario@empresa.com" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} />

          <Text style={[s.label, s.mt]}>Contrasena</Text>
          <View style={s.passRow}>
            <TextInput style={[s.input, { flex: 1, marginBottom: 0 }]} placeholder="Minimo 6 caracteres" placeholderTextColor={colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
            <TouchableOpacity style={s.eyeBtn} onPress={function() { setShowPass(!showPass); }}>
              <Text>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[s.label, s.mt]}>Repetir contrasena</Text>
          <TextInput style={s.input} placeholder="Repeti tu contrasena" placeholderTextColor={colors.textMuted} value={confirmPass} onChangeText={setConfirmPass} secureTextEntry={!showPass} />

          <Text style={[s.label, s.mt]}>Area</Text>
          <TouchableOpacity style={s.picker} onPress={function() { setShowPicker(true); }}>
            <Text style={area ? s.pickerText : s.pickerPlaceholder}>{area || 'Selecciona tu area...'}</Text>
            <Text style={s.pickerArrow}>▾</Text>
          </TouchableOpacity>
          {roleForArea !== '' && (
            <View style={[s.rolePill, area === 'Compras' ? s.roleFac : s.roleSol]}>
              <Text style={[s.roleText, { color: area === 'Compras' ? '#92400E' : '#1E40AF' }]}>
                {area === 'Compras' ? '🔧' : '👷'} Tu rol: {roleForArea}
              </Text>
            </View>
          )}

          <Text style={[s.label, s.mt]}>Nro. de legajo</Text>
          <TextInput style={s.input} placeholder="Ej: 12345" placeholderTextColor={colors.textMuted} value={legajo} onChangeText={setLegajo} keyboardType="number-pad" />

          <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleRegister} disabled={loading}>
            <Text style={s.btnText}>{loading ? 'Registrando...' : 'Crear cuenta'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showPicker} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Selecciona tu area</Text>
            <FlatList
              data={AREAS}
              keyExtractor={function(item) { return item; }}
              renderItem={function(info) {
                var item = info.item;
                return (
                  <TouchableOpacity style={[s.areaItem, area === item && s.areaItemSel]} onPress={function() { setArea(item); setShowPicker(false); }}>
                    <Text style={[s.areaText, area === item && s.areaTextSel]}>{item}</Text>
                    {item === 'Compras' && <Text style={s.areaRole}>Facilitador</Text>}
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
    </KeyboardAvoidingView>
  );
}

var s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 52, backgroundColor: colors.bgHeader },
  backText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: colors.bgCard, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border },
  label: { fontSize: 12, color: colors.textSub, marginBottom: 6, fontWeight: '500' },
  hint: { fontSize: 11, color: colors.textMuted, marginBottom: 6, marginTop: -4 },
  mt: { marginTop: 14 },
  input: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.text, fontSize: 15, marginBottom: 2 },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 10 },
  picker: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, flexDirection: 'row', justifyContent: 'space-between' },
  pickerText: { color: colors.text, fontSize: 15 },
  pickerPlaceholder: { color: colors.textMuted, fontSize: 15 },
  pickerArrow: { color: colors.textMuted, fontSize: 16 },
  rolePill: { marginTop: 8, borderRadius: 8, padding: 8, borderWidth: 1 },
  roleSol: { backgroundColor: colors.estadoEnProcesoBg, borderColor: colors.infoBorder },
  roleFac: { backgroundColor: colors.estadoPendienteBg, borderColor: colors.warnBorder },
  roleText: { fontSize: 12, fontWeight: '500' },
  btn: { backgroundColor: colors.accent, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 20 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colors.bgCard, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  modalTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 16 },
  areaItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  areaItemSel: { backgroundColor: colors.accentLight, marginHorizontal: -4, paddingHorizontal: 4, borderRadius: 8 },
  areaText: { fontSize: 15, color: colors.text },
  areaTextSel: { color: colors.accent, fontWeight: '600' },
  areaRole: { fontSize: 11, color: colors.warn, fontWeight: '500', backgroundColor: colors.warnBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  cancelBtn: { marginTop: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10 },
  cancelText: { color: colors.textSub, fontWeight: '500' },
});
