const ColumnPreference = require("../models/columnPreference.model");
const { buildFilter, buildSimpleFilter } = require("../utils/filter");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");
const { applyColumnsToResults } = require("../utils/columns");
const res_ = require("../utils/response");

class BaseController {
  constructor(Model) {
    this.Model = Model;
    // bind so 'this' works when Express calls them
    ["getAll","getById","create","update","remove","bulkDelete","getColumns","updateColumns"]
      .forEach((m) => (this[m] = this[m].bind(this)));
  }

  // ── private helpers ──────────────────────────────────

  async _getColumnPrefs(scope = "global") {
    const name = this.Model.COLLECTION_NAME;
    return (
      (await ColumnPreference.findOne({ collection: name, scope })) ||
      (await ColumnPreference.create({ collection: name, scope, columns: this.Model.DEFAULT_COLUMNS || [] }))
    );
  }

  _buildFilter(req) {
    const allowed = this.Model.FILTERABLE_FIELDS || [];
    const bodyFilter   = req.body?.filter ? buildFilter(req.body.filter, allowed) : {};
    const queryFilter  = buildSimpleFilter(req.query, allowed);
    if (!Object.keys(bodyFilter).length)  return queryFilter;
    if (!Object.keys(queryFilter).length) return bodyFilter;
    return { $and: [bodyFilter, queryFilter] };
  }

  // ── CRUD ─────────────────────────────────────────────

  async getAll(req, res) {
    try {
      const { page, limit, skip, sort } = parsePagination(req.query);
      const filter = this._buildFilter(req);
      const prefs  = await this._getColumnPrefs(req.query.scope);

      const [docs, total] = await Promise.all([
        this.Model.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        this.Model.countDocuments(filter),
      ]);

      return res_.success(res, {
        data:       applyColumnsToResults(docs, prefs.columns),
        pagination: buildPaginationMeta(total, page, limit),
      });
    } catch (e) { return res_.error(res, e.message); }
  }

  async getById(req, res) {
    try {
      const doc = await this.Model.findById(req.params.id).lean();
      if (!doc) return res_.notFound(res);
      const prefs    = await this._getColumnPrefs(req.query.scope);
      const [result] = applyColumnsToResults([doc], prefs.columns);
      return res_.success(res, { data: result });
    } catch (e) { return res_.error(res, e.message); }
  }

  async create(req, res) {
    try {
      const doc = await this.Model.create(req.body);
      return res_.created(res, { data: doc });
    } catch (e) {
      return e.name === "ValidationError"
        ? res_.badRequest(res, "Validation failed", e.errors)
        : res_.error(res, e.message);
    }
  }

  async update(req, res) {
    try {
      const doc = await this.Model.findByIdAndUpdate(
        req.params.id, { $set: req.body }, { new: true, runValidators: true }
      );
      if (!doc) return res_.notFound(res);
      return res_.success(res, { data: doc }, "Updated successfully");
    } catch (e) {
      return e.name === "ValidationError"
        ? res_.badRequest(res, "Validation failed", e.errors)
        : res_.error(res, e.message);
    }
  }

  async remove(req, res) {
    try {
      const doc = await this.Model.findByIdAndDelete(req.params.id);
      if (!doc) return res_.notFound(res);
      return res_.success(res, {}, "Deleted successfully");
    } catch (e) { return res_.error(res, e.message); }
  }

  // ── Bulk delete ───────────────────────────────────────

  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || !ids.length)
        return res_.badRequest(res, "ids must be a non-empty array");
      const { deletedCount } = await this.Model.deleteMany({ _id: { $in: ids } });
      return res_.success(res, { deletedCount }, "Bulk delete successful");
    } catch (e) { return res_.error(res, e.message); }
  }

  // ── Column management ─────────────────────────────────

  async getColumns(req, res) {
    try {
      const prefs = await this._getColumnPrefs(req.query.scope);
      return res_.success(res, { data: prefs });
    } catch (e) { return res_.error(res, e.message); }
  }

  /**
   * Body: { scope?: "global", columns: [{ key, visible?, order?, label? }] }
   * Send only the columns you want to change. Others stay as-is.
   */
  async updateColumns(req, res) {
    try {
      const { columns, scope } = req.body;
      if (!Array.isArray(columns) || !columns.length)
        return res_.badRequest(res, "columns must be a non-empty array");

      const prefs = await this._getColumnPrefs(scope);
      for (const u of columns) {
        const col = prefs.columns.find((c) => c.key === u.key);
        if (col) {
          if (u.visible !== undefined) col.visible = u.visible;
          if (u.order   !== undefined) col.order   = u.order;
          if (u.label   !== undefined) col.label   = u.label;
        }
      }
      await prefs.save();
      return res_.success(res, { data: prefs }, "Columns updated");
    } catch (e) { return res_.error(res, e.message); }
  }
}

module.exports = BaseController;
