import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeSolicitante from './src/screens/HomeSolicitante';
import HomeFacilitador from './src/screens/HomeFacilitador';
import DetailScreen from './src/screens/DetailScreen';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'red', marginBottom: 16 }}>Error al iniciar</Text>
          <Text style={{ fontSize: 13, color: '#333', textAlign: 'center' }}>
            {this.state.error ? this.state.error.toString() : 'Error desconocido'}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function Navigator() {
  var app = useApp();
  var screenState = useState('login');
  var screen = screenState[0];
  var setScreen = screenState[1];
  var pedidoState = useState(null);
  var selectedPedidoId = pedidoState[0];
  var setSelectedPedidoId = pedidoState[1];

  function handleLogin() { setScreen('home'); }
  function handleLogout() { app.logout(); setScreen('login'); }
  function handleGoRegister() { setScreen('register'); }
  function handleRegistered() { setScreen('login'); }
  function handleSelectPedido(id) { setSelectedPedidoId(id); setScreen('detail'); }
  function handleBack() { setSelectedPedidoId(null); setScreen('home'); }

  if (screen === 'login') {
    return React.createElement(LoginScreen, { onLogin: handleLogin, onGoRegister: handleGoRegister });
  }
  if (screen === 'register') {
    return React.createElement(RegisterScreen, { onBack: handleGoRegister, onRegistered: handleRegistered });
  }
  if (screen === 'home' && app.currentUser && app.currentUser.role === 'solicitante') {
    return React.createElement(HomeSolicitante, { onSelectPedido: handleSelectPedido, onLogout: handleLogout });
  }
  if (screen === 'home' && app.currentUser && app.currentUser.role === 'facilitador') {
    return React.createElement(HomeFacilitador, { onSelectPedido: handleSelectPedido, onLogout: handleLogout });
  }
  if (screen === 'detail' && selectedPedidoId) {
    return React.createElement(DetailScreen, { pedidoId: selectedPedidoId, onBack: handleBack });
  }
  return React.createElement(LoginScreen, { onLogin: handleLogin, onGoRegister: handleGoRegister });
}

export default function App() {
  return React.createElement(
    ErrorBoundary, null,
    React.createElement(
      AppProvider, null,
      React.createElement(
        View, { style: s.root },
        React.createElement(StatusBar, { barStyle: 'light-content', backgroundColor: '#1A56A0' }),
        React.createElement(Navigator, null)
      )
    )
  );
}

var s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1A56A0' },
});
