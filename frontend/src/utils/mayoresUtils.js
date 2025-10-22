// utils/mayoresUtils.js
// Utilidades para Mayores Auxiliares (Esquemas de T)

/**
 * Obtener saldo inicial de una cuenta desde Balance de Saldos
 * @param {string} cuenta - Nombre de la cuenta
 * @param {Array} balanceRows - Filas del balance de saldos
 * @returns {Object} {monto, columna: 'debe'|'haber', clasificacion}
 */
export const getSaldoInicialCuenta = (cuenta, balanceRows) => {
  const row = balanceRows.find(r => 
    r.cuenta.toLowerCase() === cuenta.toLowerCase()
  );
  
  if (!row) {
    return { monto: 0, columna: null, clasificacion: null };
  }
  
  const monto = parseFloat(row.monto) || 0;
  
  // Determinar columna según clasificación
  let columna = null;
  if (row.clasificacion === 'Activo') {
    columna = 'debe';
  } else if (row.clasificacion === 'Pasivo' || row.clasificacion === 'Capital') {
    columna = 'haber';
  }
  
  return {
    monto,
    columna,
    clasificacion: row.clasificacion
  };
};

/**
 * Obtener saldo inicial de una orden desde Inventario - Productos en Proceso
 * @param {string} ordenDetalle - Detalle de la orden (ej: "Orden #001")
 * @param {Array} processRows - Filas de productos en proceso
 * @returns {Object} {monto, existe}
 */
export const getSaldoInicialOrden = (ordenDetalle, processRows) => {
  const row = processRows.find(r => 
    r.detalle.toLowerCase() === ordenDetalle.toLowerCase()
  );
  
  if (!row) {
    return { monto: 0, existe: false, producto: null };
  }
  
  // Calcular total (siempre va en DEBE para órdenes)
  const monto = (parseFloat(row.materiales) || 0) + 
                (parseFloat(row.manoObra) || 0) + 
                (parseFloat(row.gastosF) || 0);
  
  return {
    monto,
    existe: true,
    producto: row.producto
  };
};

/**
 * Obtener movimientos de una cuenta desde Registros Contables
 * @param {string} cuenta - Nombre de la cuenta
 * @param {Array} registrosRows - Filas de registros contables
 * @returns {Array} Lista de movimientos
 */
export const getMovimientosCuenta = (cuenta, registrosRows) => {
  return registrosRows
    .filter(r => r.cuenta.toLowerCase() === cuenta.toLowerCase())
    .map(r => ({
      id: r.id,
      fecha: r.fecha,
      noAsiento: r.noAsiento,
      concepto: r.concepto,
      debe: parseFloat(r.debe) || 0,
      haber: parseFloat(r.haber) || 0
    }))
    .sort((a, b) => {
      // Ordenar por fecha y luego por número de asiento
      if (a.fecha === b.fecha) {
        return a.noAsiento - b.noAsiento;
      }
      return new Date(a.fecha) - new Date(b.fecha);
    });
};

/**
 * Calcular esquema de T completo para una cuenta
 * @param {string} cuenta - Nombre de la cuenta
 * @param {Object} saldoInicial - {monto, columna, clasificacion}
 * @param {Array} movimientos - Lista de movimientos
 * @returns {Object} Esquema de T con saldo calculado
 */
export const calcularEsquemaCuenta = (cuenta, saldoInicial, movimientos) => {
  let saldo = saldoInicial.monto;
  const clasificacion = saldoInicial.clasificacion;
  
  // Construir movimientos con saldo acumulado
  const movimientosConSaldo = movimientos.map(mov => {
    // Calcular saldo según clasificación
    if (clasificacion === 'Activo') {
      saldo = saldo + mov.debe - mov.haber;
    } else if (clasificacion === 'Pasivo' || clasificacion === 'Capital') {
      saldo = saldo + mov.haber - mov.debe;
    } else {
      // Si no hay clasificación, usar regla estándar
      saldo = saldo + mov.debe - mov.haber;
    }
    
    return {
      ...mov,
      saldo
    };
  });
  
  return {
    cuenta,
    clasificacion,
    saldoInicial: saldoInicial.monto,
    columnaInicial: saldoInicial.columna,
    movimientos: movimientosConSaldo,
    saldoFinal: saldo,
    totalDebe: saldoInicial.columna === 'debe' ? saldoInicial.monto : 0 + 
               movimientos.reduce((sum, m) => sum + m.debe, 0),
    totalHaber: saldoInicial.columna === 'haber' ? saldoInicial.monto : 0 + 
                movimientos.reduce((sum, m) => sum + m.haber, 0)
  };
};

/**
 * Calcular esquema de T para una orden de producción
 * @param {string} ordenDetalle - Detalle de la orden
 * @param {Object} saldoInicial - {monto, producto}
 * @param {Array} movimientos - Lista de movimientos
 * @returns {Object} Esquema de T de la orden
 */
export const calcularEsquemaOrden = (ordenDetalle, saldoInicial, movimientos) => {
  let saldo = saldoInicial.monto; // Inicia en DEBE
  
  // Construir movimientos con saldo acumulado
  const movimientosConSaldo = movimientos.map(mov => {
    // Para órdenes, siempre: saldo = saldo + debe - haber
    saldo = saldo + mov.debe - mov.haber;
    
    return {
      ...mov,
      saldo
    };
  });
  
  return {
    orden: ordenDetalle,
    producto: saldoInicial.producto,
    saldoInicial: saldoInicial.monto,
    movimientos: movimientosConSaldo,
    saldoFinal: saldo,
    totalDebe: saldoInicial.monto + movimientos.reduce((sum, m) => sum + m.debe, 0),
    totalHaber: movimientos.reduce((sum, m) => sum + m.haber, 0)
  };
};

/**
 * Obtener lista de cuentas disponibles (de Balance + Registros)
 * @param {Array} balanceRows - Filas del balance
 * @param {Array} registrosRows - Filas de registros
 * @returns {Array} Lista única de cuentas
 */

export const getCuentasDisponibles = (balanceRows, registrosRows) => {
  console.log('🔍 [getCuentasDisponibles] Inicio');
  console.log('🔍 [getCuentasDisponibles] balanceRows:', balanceRows);
  console.log('🔍 [getCuentasDisponibles] registrosRows:', registrosRows);

  // Verificar que sean arrays
  if (!Array.isArray(balanceRows)) {
    console.error('❌ balanceRows NO es un array:', typeof balanceRows);
    return [];
  }
  if (!Array.isArray(registrosRows)) {
    console.error('❌ registrosRows NO es un array:', typeof registrosRows);
    return [];
  }

  const cuentasBalance = balanceRows.map(r => {
    console.log('🔍 [Balance] Procesando fila:', r);
    return {
      cuenta: r.cuenta,
      clasificacion: r.clasificacion,
      origen: 'balance'
    };
  });
  
  console.log('🔍 [getCuentasDisponibles] Cuentas del balance:', cuentasBalance);
  
  const cuentasRegistros = registrosRows
    .map(r => r.cuenta)
    .filter(cuenta => {
      const valido = cuenta && cuenta.trim();
      console.log('🔍 [Registros] Cuenta:', cuenta, 'Válido:', valido);
      return valido;
    })
    .filter((cuenta, index, self) => self.indexOf(cuenta) === index)
    .map(cuenta => {
      const enBalance = balanceRows.find(b => 
        b.cuenta.toLowerCase() === cuenta.toLowerCase()
      );
      return {
        cuenta,
        clasificacion: enBalance ? enBalance.clasificacion : null,
        origen: enBalance ? 'balance' : 'solo_registros'
      };
    });
  
  console.log('🔍 [getCuentasDisponibles] Cuentas de registros:', cuentasRegistros);
  
  const todasCuentas = [...cuentasBalance];
  
  cuentasRegistros.forEach(cr => {
    const existe = todasCuentas.some(c => 
      c.cuenta.toLowerCase() === cr.cuenta.toLowerCase()
    );
    if (!existe) {
      todasCuentas.push(cr);
    }
  });
  
  console.log('🔍 [getCuentasDisponibles] Total cuentas (antes de ordenar):', todasCuentas);
  
  const resultado = todasCuentas.sort((a, b) => a.cuenta.localeCompare(b.cuenta));
  
  console.log('🔍 [getCuentasDisponibles] Resultado final:', resultado);
  console.log('🔍 [getCuentasDisponibles] Total:', resultado.length);
  
  return resultado;
};



/**
 * Obtener lista de órdenes disponibles (de Inventario)
 * @param {Array} processRows - Filas de productos en proceso
 * @returns {Array} Lista de órdenes
 */
export const getOrdenesDisponibles = (processRows) => {
  // ⭐ Validar que sea un array
  if (!Array.isArray(processRows)) {
    console.warn('processRows no es un array:', processRows);
    return [];
  }
  
  return processRows
    .filter(r => r && r.detalle && r.detalle.trim())
    .map(r => ({
      detalle: r.detalle,
      producto: r.producto || 'Sin producto',
      total: (parseFloat(r.materiales) || 0) + 
             (parseFloat(r.manoObra) || 0) + 
             (parseFloat(r.gastosF) || 0)
    }));
};

/**
 * Verificar si una cuenta es en realidad una orden
 * @param {string} cuenta - Nombre de la cuenta
 * @param {Array} ordenesDisponibles - Lista de órdenes
 * @returns {boolean} True si es una orden
 */
export const esOrdenProduccion = (cuenta, ordenesDisponibles) => {
  return ordenesDisponibles.some(orden => 
    orden.detalle.toLowerCase() === cuenta.toLowerCase()
  );
};

/**
 * Formatear fecha para mostrar
 * @param {string} fecha - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatFecha = (fecha) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-MX', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};