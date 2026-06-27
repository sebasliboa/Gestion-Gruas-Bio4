import React, { createContext, useContext, useState } from 'react';
import { enviarEmailBienvenida, enviarEmailConfirmacion, enviarEmailNuevoPedido } from '../data/emailService';

var AppContext = createContext(null);
var pedidoCounter = 1;

export function AppProvider(props) {
  var children = props.children;
  var userState = useState([]);
  var users = userState[0];
  var setUsers = userState[1];

  var currentUserState = useState(null);
  var currentUser = currentUserState[0];
  var setCurrentUser = currentUserState[1];

  var pedidosState = useState([]);
  var pedidos = pedidosState[0];
  var setPedidos = pedidosState[1];

  function login(email, password) {
    var user = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].email.toLowerCase() === email.toLowerCase()) {
        user = users[i];
        break;
      }
    }
    if (!user) return 'not_found';
    if (user.password !== password) return 'wrong_pass';
    setCurrentUser(user);
    return 'ok';
  }

  function logout() {
    setCurrentUser(null);
  }

  function register(data) {
    var exists = false;
    for (var i = 0; i < users.length; i++) {
      if (users[i].email.toLowerCase() === data.email.toLowerCase()) {
        exists = true;
        break;
      }
    }
    if (exists) return 'already_exists';
    var role = data.area === 'Compras' ? 'facilitador' : 'solicitante';
    var newUser = {
      id: String(Date.now()),
      email: data.email,
      name: data.name,
      role: role,
      password: data.password,
      area: data.area,
      legajo: data.legajo,
    };
    setUsers(function(prev) { return prev.concat([newUser]); });
    enviarEmailBienvenida({ name: data.name, email: data.email, area: data.area, legajo: data.legajo });
    return 'ok';
  }

  function crearPedido(capacidad, dias) {
    if (!currentUser) return;
    var today = new Date().toISOString().split('T')[0];
    var num = String(pedidoCounter);
    while (num.length < 3) num = '0' + num;
    pedidoCounter++;
    var nuevo = {
      id: 'PED-' + num,
      solicitanteId: currentUser.id,
      solicitanteNombre: currentUser.name,
      solicitanteEmail: currentUser.email,
      fechaSolicitud: today,
      capacidad: capacidad,
      dias: dias,
      estado: 'pendiente',
      facilitadorId: null,
      facilitadorNombre: null,
      empresa: null,
      horasUso: null,
      centroCostos: null,
      nroRemito: null,
    };
    setPedidos(function(prev) { return [nuevo].concat(prev); });
    var facilitadoresEmails = [];
    for (var i = 0; i < users.length; i++) {
      if (users[i].role === 'facilitador') facilitadoresEmails.push(users[i].email);
    }
    if (facilitadoresEmails.length > 0) {
      enviarEmailNuevoPedido({
        pedidoId: nuevo.id,
        solicitanteNombre: currentUser.name,
        capacidad: capacidad,
        dias: dias,
        fecha: today,
        facilitadoresEmails: facilitadoresEmails.join(','),
      });
    }
  }

  function asignarFacilitador(pedidoId) {
    if (!currentUser) return;
    setPedidos(function(prev) {
      return prev.map(function(p) {
        if (p.id === pedidoId) {
          return Object.assign({}, p, {
            facilitadorId: currentUser.id,
            facilitadorNombre: currentUser.name,
            estado: 'en_proceso',
          });
        }
        return p;
      });
    });
  }

  function actualizarPedido(pedidoId, fields) {
    setPedidos(function(prev) {
      return prev.map(function(p) {
        if (p.id === pedidoId) return Object.assign({}, p, fields);
        return p;
      });
    });
  }

  function setEstado(pedidoId, estado, empresa) {
    var updatedPedido = null;
    setPedidos(function(prev) {
      return prev.map(function(p) {
        if (p.id !== pedidoId) return p;
        var updated = Object.assign({}, p, { estado: estado });
        if (empresa !== undefined) updated.empresa = empresa;
        if (!p.facilitadorId && currentUser) {
          updated.facilitadorId = currentUser.id;
          updated.facilitadorNombre = currentUser.name;
        }
        updatedPedido = updated;
        return updated;
      });
    });
    if (estado === 'confirmado' && updatedPedido) {
      var p = updatedPedido;
      enviarEmailConfirmacion({
        toName: p.solicitanteNombre,
        toEmail: p.solicitanteEmail,
        pedidoId: p.id,
        empresa: p.empresa || '',
        capacidad: p.capacidad,
        dias: p.dias,
        facilitadorNombre: p.facilitadorNombre || '',
      });
    }
  }

  function cerrarPedido(pedidoId, horas, costo, remito) {
    setPedidos(function(prev) {
      return prev.map(function(p) {
        if (p.id === pedidoId) {
          return Object.assign({}, p, {
            estado: 'cerrado',
            horasUso: horas,
            centroCostos: costo,
            nroRemito: remito,
          });
        }
        return p;
      });
    });
  }

  var value = {
    currentUser: currentUser,
    users: users,
    pedidos: pedidos,
    login: login,
    logout: logout,
    register: register,
    crearPedido: crearPedido,
    asignarFacilitador: asignarFacilitador,
    actualizarPedido: actualizarPedido,
    setEstado: setEstado,
    cerrarPedido: cerrarPedido,
  };

  return React.createElement(AppContext.Provider, { value: value }, children);
}

export function useApp() {
  var ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
