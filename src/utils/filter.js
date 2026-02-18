/**
 * Converts a structured filter payload → Mongoose query object.
 *
 * Filter payload shape:
 * {
 *   "operator": "AND",          // "AND" | "OR"
 *   "conditions": [
 *     { "field": "role",  "op": "eq",  "value": "admin" },
 *     { "field": "email", "op": "regex","value": "gmail" },
 *     {
 *       "operator": "OR",
 *       "conditions": [...]    // ← nested group
 *     }
 *   ]
 * }
 */

const OPS = {
  eq:     (v) => ({ $eq: v }),
  ne:     (v) => ({ $ne: v }),
  gt:     (v) => ({ $gt: v }),
  gte:    (v) => ({ $gte: v }),
  lt:     (v) => ({ $lt: v }),
  lte:    (v) => ({ $lte: v }),
  in:     (v) => ({ $in:  Array.isArray(v) ? v : [v] }),
  nin:    (v) => ({ $nin: Array.isArray(v) ? v : [v] }),
  regex:  (v) => ({ $regex: v, $options: "i" }),
  exists: (v) => ({ $exists: Boolean(v) }),
};

const buildFilter = (node, allowedFields = []) => {
  if (!node || typeof node !== "object") return {};

  // GROUP node  →  { operator, conditions[] }
  if (Array.isArray(node.conditions)) {
    const mongoOp   = node.operator?.toUpperCase() === "OR" ? "$or" : "$and";
    const built     = node.conditions
      .map((child) => buildFilter(child, allowedFields))
      .filter((c)  => Object.keys(c).length > 0);
    return built.length ? { [mongoOp]: built } : {};
  }

  // CONDITION node  →  { field, op, value }
  const { field, op, value } = node;
  if (!field || !op) return {};
  if (allowedFields.length && !allowedFields.includes(field)) {
    console.warn(`[filter] "${field}" not in allowedFields — skipped`);
    return {};
  }
  const builder = OPS[op?.toLowerCase()];
  if (!builder) {
    console.warn(`[filter] unknown op "${op}" — skipped`);
    return {};
  }
  return { [field]: builder(value) };
};

// Handles simple query-string filters: ?role=admin&createdAt[gte]=2024-01-01
const buildSimpleFilter = (query = {}, allowedFields = []) => {
  const skip  = new Set(["page", "limit", "sort", "sortOrder", "scope"]);
  const filter = {};

  for (const key of Object.keys(query)) {
    if (skip.has(key)) continue;
    const match = key.match(/^(\w+)\[(\w+)\]$/);       // field[op]=value
    if (match) {
      const [, f, op] = match;
      if (allowedFields.length && !allowedFields.includes(f)) continue;
      const builder = OPS[op];
      if (builder) filter[f] = { ...filter[f], ...builder(query[key]) };
    } else {
      if (allowedFields.length && !allowedFields.includes(key)) continue;
      filter[key] = query[key];
    }
  }

  return filter;
};

module.exports = { buildFilter, buildSimpleFilter };
