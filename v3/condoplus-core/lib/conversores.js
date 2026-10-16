// André — conversores pra deixar cada campo no tipo certo (texto, número, booleano...)
const Conv = {
  texto: (v) => (v == null ? '' : String(v).trim()),
  textoOuNulo: (v) => (v == null || String(v).trim() === '' ? null : String(v).trim()),
  inteiro: (v) => (v === '' || v == null ? 0 : parseInt(v, 10) || 0),
  idOuNulo: (v) => (v === '' || v == null ? null : Number(v)),
  decimal: (v) => (v === '' || v == null ? 0 : Number(v)),
  booleano: (v) => v === true || v === 1 || v === '1' || v === 'true',
  json: (v) => (typeof v === 'string' ? JSON.parse(v || '{}') : { ...(v || {}) }),
};

function hojeISO() {  // hoje no formato AAAA-MM-DD
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const ehDataISO = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ''));
const ehEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ''));

module.exports = { Conv, hojeISO, ehDataISO, ehEmail };
