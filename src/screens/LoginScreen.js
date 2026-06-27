import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../data/theme';

export default function LoginScreen(props) {
  var onLogin = props.onLogin;
  var onGoRegister = props.onGoRegister;
  var app = useApp();

  var emailState = useState('');
  var email = emailState[0];
  var setEmail = emailState[1];

  var passState = useState('');
  var password = passState[0];
  var setPassword = passState[1];

  var loadingState = useState(false);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  var showPassState = useState(false);
  var showPass = showPassState[0];
  var setShowPass = showPassState[1];

  function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa tu correo y contrasena.');
      return;
    }
    setLoading(true);
    setTimeout(function() {
      var result = app.login(email.trim(), password);
      setLoading(false);
      if (result === 'ok') {
        onLogin();
      } else if (result === 'not_found') {
        Alert.alert('Usuario no encontrado', 'No existe una cuenta con ese correo.');
      } else {
        Alert.alert('Contrasena incorrecta', 'Verifica tu contrasena e intenta de nuevo.');
      }
    }, 300);
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <View style={s.iconBox}>
            <Text style={s.icon}>🏗️</Text>
          </View>
          <Text style={s.title}>GruasApp</Text>
          <Text style={s.subtitle}>Gestion de pedidos de izaje</Text>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>Iniciar sesion</Text>
          <Text style={s.label}>Correo electronico</Text>
          <TextInput
            style={s.input}
            placeholder="usuario@empresa.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          <Text style={[s.label, { marginTop: 14 }]}>Contrasena</Text>
          <View style={s.passRow}>
            <TextInput
              style={[s.input, { flex: 1, marginBottom: 0 }]}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity style={s.eyeBtn} onPress={function() { setShowPass(!showPass); }}>
              <Text style={s.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleLogin} disabled={loading}>
            <Text style={s.btnText}>{loading ? 'Ingresando...' : 'Ingresar'}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={s.regLink} onPress={onGoRegister}>
          <Text style={s.regText}>¿Sos nuevo? <Text style={s.regBold}>Registrate aca</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

var s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 28 },
  iconBox: { width: 72, height: 72, borderRadius: 20, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  icon: { fontSize: 36 },
  title: { fontSize: 26, fontWeight: '700', color: colors.accent },
  subtitle: { fontSize: 13, color: colors.textSub, marginTop: 4 },
  card: { backgroundColor: colors.bgCard, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 18 },
  label: { fontSize: 12, color: colors.textSub, marginBottom: 6, fontWeight: '500' },
  input: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.text, fontSize: 15, marginBottom: 4 },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 10 },
  eyeText: { fontSize: 18 },
  btn: { backgroundColor: colors.accent, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 18 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  regLink: { alignItems: 'center', paddingVertical: 12 },
  regText: { fontSize: 14, color: colors.textSub },
  regBold: { color: colors.accent, fontWeight: '600' },
});
