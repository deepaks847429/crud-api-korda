const parsePagination = (query = {}) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip  = (page - 1) * limit;
  const sort  = { [query.sort || "createdAt"]: query.sortOrder === "asc" ? 1 : -1 };
  return { page, limit, skip, sort };
};

const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages:  Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});

module.exports = { parsePagination, buildPaginationMeta };
