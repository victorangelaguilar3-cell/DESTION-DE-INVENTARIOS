// =============================================
//   Inventario Escolar – Primaria | app.js
// =============================================

// ----------------------------
// Datos iniciales de ejemplo
// ----------------------------

let items = [
  { id: 1,  nombre: 'Lápices grafito HB',          cat: 'Papelería',  unidad: 'Docenas', stock: 12, min: 5,  ubicacion: 'Bodega A'     },
  { id: 2,  nombre: 'Hojas blancas tamaño carta',   cat: 'Papelería',  unidad: 'Resmas',  stock:  3, min: 5,  ubicacion: 'Bodega A'     },
  { id: 3,  nombre: 'Marcadores pizarrón',           cat: 'Papelería',  unidad: 'Cajas',   stock:  8, min: 3,  ubicacion: 'Dirección'    },
  { id: 4,  nombre: 'Borrador pizarrón',             cat: 'Papelería',  unidad: 'Piezas',  stock:  0, min: 4,  ubicacion: 'Dirección'    },
  { id: 5,  nombre: 'Tijeras escolar',               cat: 'Papelería',  unidad: 'Piezas',  stock: 20, min: 10, ubicacion: 'Aula 1'       },
  { id: 6,  nombre: 'Escoba',                        cat: 'Limpieza',   unidad: 'Piezas',  stock:  6, min: 3,  ubicacion: 'Bodega B'     },
  { id: 7,  nombre: 'Jabón de manos',                cat: 'Limpieza',   unidad: 'Litros',  stock:  2, min: 5,  ubicacion: 'Bodega B'     },
  { id: 8,  nombre: 'Cloro',                         cat: 'Limpieza',   unidad: 'Litros',  stock: 10, min: 4,  ubicacion: 'Bodega B'     },
  { id: 9,  nombre: 'Computadora portátil',          cat: 'Tecnología', unidad: 'Piezas',  stock:  5, min: 2,  ubicacion: 'Lab. Cómputo' },
  { id: 10, nombre: 'Proyector',                     cat: 'Tecnología', unidad: 'Piezas',  stock:  2, min: 1,  ubicacion: 'Dirección'    },
  { id: 11, nombre: 'Balón de fútbol',               cat: 'Deportes',   unidad: 'Piezas',  stock:  4, min: 2,  ubicacion: 'Bodega C'     },
  { id: 12, nombre: 'Cuadernos cuadrícula',          cat: 'Papelería',  unidad: 'Docenas', stock:  1, min: 3,  ubicacion: 'Bodega A'     },
];

let movimientos = [
  { tipo: 'entrada', item: 'Lápices grafito HB',   qty: 12, resp: 'Mtro. García',    nota: 'Compra inicio de ciclo',  fecha: fmtDate(new Date(Date.now() - 86400000 * 2)) },
  { tipo: 'salida',  item: 'Marcadores pizarrón',   qty:  2, resp: 'Mtra. López',     nota: 'Reposición aula 3',       fecha: fmtDate(new Date(Date.now() - 86400000))     },
  { tipo: 'salida',  item: 'Balón de fútbol',        qty:  1, resp: 'Prof. Hernández', nota: 'Educación Física',        fecha: fmtDate(new Date())                          },
  { tipo: 'entrada', item: 'Cloro',                  qty:  5, resp: 'Intendente',      nota: 'Compra semanal',          fecha: fmtDate(new Date())                          },
];

let nextId  = 13;
let editId  = null;
let movTipo = 'entrada';

// ----------------------------
// Utilidades
// ----------------------------

function fmtDate(d) {
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getStatus(it) {
  if (it.stock === 0)       return 'agotado';
  if (it.stock <= it.min)   return 'bajo';
  return 'disponible';
}

function statusLabel(s) {
  if (s === 'agotado') return 'Agotado';
  if (s === 'bajo')    return 'Stock bajo';
  return 'Disponible';
}

// ----------------------------
// Render: métricas
// ----------------------------

function renderMetrics() {
  const total    = items.length;
  const agotados = items.filter(i => getStatus(i) === 'agotado').length;
  const bajos    = items.filter(i => getStatus(i) === 'bajo').length;
  const ok       = items.filter(i => getStatus(i) === 'disponible').length;

  document.getElementById('metrics').innerHTML = `
    <div class="metric">
      <div class="metric-label">Total artículos</div>
      <div class="metric-value">${total}</div>
      <div class="metric-sub ok"><i class="ti ti-package"></i> en sistema</div>
    </div>
    <div class="metric">
      <div class="metric-label">Disponibles</div>
      <div class="metric-value">${ok}</div>
      <div class="metric-sub ok">Stock suficiente</div>
    </div>
    <div class="metric">
      <div class="metric-label">Stock bajo</div>
      <div class="metric-value">${bajos}</div>
      <div class="metric-sub warn">Requieren atención</div>
    </div>
    <div class="metric">
      <div class="metric-label">Agotados</div>
      <div class="metric-value">${agotados}</div>
      <div class="metric-sub danger">Sin existencias</div>
    </div>
  `;
}

// ----------------------------
// Render: tabla de inventario
// ----------------------------

function renderTable() {
  const q      = document.getElementById('search').value.toLowerCase();
  const catF   = document.getElementById('cat-filter').value;
  const statF  = document.getElementById('status-filter').value;

  const filtered = items.filter(it => {
    if (q    && !it.nombre.toLowerCase().includes(q) && !it.cat.toLowerCase().includes(q)) return false;
    if (catF  && it.cat        !== catF)  return false;
    if (statF && getStatus(it) !== statF) return false;
    return true;
  });

  const tbody = document.getElementById('table-body');

  if (!filtered.length) {
    tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="empty">
          <i class="ti ti-mood-empty"></i>
          No se encontraron artículos
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(it => {
    const s = getStatus(it);
    return `
      <tr>
        <td title="${it.nombre}">${it.nombre}</td>
        <td><span class="badge cat">${it.cat}</span></td>
        <td style="text-align:right;font-weight:600">${it.stock} ${it.unidad}</td>
        <td style="text-align:right;color:#aaa">${it.min}</td>
        <td title="${it.ubicacion}">${it.ubicacion}</td>
        <td><span class="badge ${s}">${statusLabel(s)}</span></td>
        <td>
          <div class="actions">
            <button class="icon-btn" title="Editar"    onclick="openEdit(${it.id})"><i class="ti ti-edit"></i></button>
            <button class="icon-btn" title="Eliminar"  onclick="deleteItem(${it.id})"><i class="ti ti-trash"></i></button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ----------------------------
// Render: historial de movimientos
// ----------------------------

function renderMovimientos() {
  const list = document.getElementById('mov-list');

  if (!movimientos.length) {
    list.innerHTML = '<div class="empty"><i class="ti ti-clock"></i>No hay movimientos registrados</div>';
    return;
  }

  list.innerHTML = [...movimientos].reverse().map(m => `
    <div class="mov-item">
      <div class="mov-left">
        <div class="mov-icon ${m.tipo}">
          <i class="ti ti-arrow-${m.tipo === 'entrada' ? 'down' : 'up'}-circle"></i>
        </div>
        <div>
          <div class="mov-name">${m.item}</div>
          <div class="mov-meta">${m.resp} · ${m.nota} · ${m.fecha}</div>
        </div>
      </div>
      <div class="mov-qty ${m.tipo}">${m.tipo === 'entrada' ? '+' : '-'}${m.qty}</div>
    </div>
  `).join('');
}

// ----------------------------
// Render: alertas
// ----------------------------

function renderAlertas() {
  const orden  = { agotado: 0, bajo: 1 };
  const lista  = items
    .filter(i => getStatus(i) !== 'disponible')
    .sort((a, b) => orden[getStatus(a)] - orden[getStatus(b)]);

  const el = document.getElementById('alertas-list');

  if (!lista.length) {
    el.innerHTML = `
      <div class="empty">
        <i class="ti ti-circle-check" style="color:#1D9E75"></i>
        Todo el inventario está en buen estado
      </div>`;
    return;
  }

  el.innerHTML = lista.map(it => {
    const s = getStatus(it);
    return `
      <div class="mov-item" style="margin-bottom:8px">
        <div class="mov-left">
          <div class="mov-icon ${s === 'agotado' ? 'salida' : 'entrada'}">
            <i class="ti ti-alert-triangle"></i>
          </div>
          <div>
            <div class="mov-name">${it.nombre}</div>
            <div class="mov-meta">${it.cat} · ${it.ubicacion} · Stock: ${it.stock} ${it.unidad} (mín. ${it.min})</div>
          </div>
        </div>
        <span class="badge ${s}">${statusLabel(s)}</span>
      </div>`;
  }).join('');
}

// ----------------------------
// Navegación por tabs
// ----------------------------

function setTab(name, btn) {
  ['inventario', 'movimientos', 'alertas'].forEach(t => {
    document.getElementById('tab-' + t).style.display = (t === name) ? 'block' : 'none';
  });
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (name === 'movimientos') renderMovimientos();
  if (name === 'alertas')     renderAlertas();
}

// ----------------------------
// Modal: agregar artículo
// ----------------------------

function openAdd() {
  document.getElementById('f-nombre').value    = '';
  document.getElementById('f-unidad').value    = '';
  document.getElementById('f-stock').value     = 0;
  document.getElementById('f-min').value       = 5;
  document.getElementById('f-ubicacion').value = '';
  document.getElementById('modal-add-title').textContent = 'Agregar artículo';
  document.getElementById('modal-add').classList.add('open');
}

function saveItem() {
  const nombre = document.getElementById('f-nombre').value.trim();
  if (!nombre) { document.getElementById('f-nombre').focus(); return; }

  items.push({
    id:        nextId++,
    nombre,
    cat:       document.getElementById('f-cat').value,
    unidad:    document.getElementById('f-unidad').value.trim() || 'Piezas',
    stock:     parseInt(document.getElementById('f-stock').value)     || 0,
    min:       parseInt(document.getElementById('f-min').value)       || 0,
    ubicacion: document.getElementById('f-ubicacion').value.trim()    || '-',
  });

  closeModal('modal-add');
  renderAll();
}

// ----------------------------
// Modal: editar artículo
// ----------------------------

function openEdit(id) {
  const it = items.find(i => i.id === id);
  if (!it) return;
  editId = id;

  document.getElementById('e-nombre').value    = it.nombre;
  document.getElementById('e-cat').value       = it.cat;
  document.getElementById('e-unidad').value    = it.unidad;
  document.getElementById('e-stock').value     = it.stock;
  document.getElementById('e-min').value       = it.min;
  document.getElementById('e-ubicacion').value = it.ubicacion;

  document.getElementById('modal-edit').classList.add('open');
}

function saveEdit() {
  const it = items.find(i => i.id === editId);
  if (!it) return;

  it.nombre    = document.getElementById('e-nombre').value.trim()    || it.nombre;
  it.cat       = document.getElementById('e-cat').value;
  it.unidad    = document.getElementById('e-unidad').value.trim()    || it.unidad;
  it.stock     = parseInt(document.getElementById('e-stock').value)  || 0;
  it.min       = parseInt(document.getElementById('e-min').value)    || 0;
  it.ubicacion = document.getElementById('e-ubicacion').value.trim() || it.ubicacion;

  closeModal('modal-edit');
  renderAll();
}

// ----------------------------
// Eliminar artículo
// ----------------------------

function deleteItem(id) {
  if (!confirm('¿Eliminar este artículo del inventario?')) return;
  items = items.filter(i => i.id !== id);
  renderAll();
}

// ----------------------------
// Modal: registrar movimiento
// ----------------------------

function openMov(tipo) {
  movTipo = tipo;
  document.getElementById('modal-mov-title').textContent =
    tipo === 'entrada' ? 'Registrar entrada' : 'Registrar salida';

  const sel = document.getElementById('m-item');
  sel.innerHTML = items.map(it => `<option value="${it.nombre}">${it.nombre}</option>`).join('');

  document.getElementById('m-qty').value  = 1;
  document.getElementById('m-resp').value = '';
  document.getElementById('m-nota').value = '';

  document.getElementById('modal-mov').classList.add('open');
}

function saveMov() {
  const itemNombre = document.getElementById('m-item').value;
  const qty        = parseInt(document.getElementById('m-qty').value) || 0;
  if (!qty) return;

  const it = items.find(i => i.nombre === itemNombre);
  if (it) {
    if (movTipo === 'entrada') {
      it.stock += qty;
    } else {
      it.stock = Math.max(0, it.stock - qty);
    }
  }

  movimientos.push({
    tipo:  movTipo,
    item:  itemNombre,
    qty,
    resp:  document.getElementById('m-resp').value.trim() || 'Sin especificar',
    nota:  document.getElementById('m-nota').value.trim() || '-',
    fecha: fmtDate(new Date()),
  });

  closeModal('modal-mov');
  renderAll();
}

// ----------------------------
// Cerrar modales
// ----------------------------

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Cerrar modal al hacer clic en el fondo
document.querySelectorAll('.modal-bg').forEach(bg => {
  bg.addEventListener('click', e => {
    if (e.target === bg) bg.classList.remove('open');
  });
});

// ----------------------------
// Render general
// ----------------------------

function renderAll() {
  renderMetrics();
  renderTable();
}

// Inicializar
renderAll();

// ----------------------------
// Cerrar sesión
// ----------------------------

function cerrarSesion() {
  if (confirm('¿Cerrar sesión?')) {
    sessionStorage.removeItem('inv_auth');
    window.location.href = 'login.html';
  }
}