// Reorders and hides fields on a plain doc object based on column prefs
const applyColumns = (doc, columns = []) => {
  if (!columns.length) return doc;
  const sorted    = [...columns].sort((a, b) => a.order - b.order);
  const reordered = {};
  for (const col of sorted) {
    if (col.visible && doc[col.key] !== undefined) {
      reordered[col.key] = doc[col.key];
    }
  }
  if (doc._id !== undefined) reordered._id = doc._id;
  return reordered;
};

const applyColumnsToResults = (docs, columns = []) =>
  columns.length ? docs.map((doc) => applyColumns(doc, columns)) : docs;

module.exports = { applyColumnsToResults };
