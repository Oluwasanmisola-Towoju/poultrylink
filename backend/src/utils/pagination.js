function getPagination(query, defaults = { page: 1, limit: 20, maxLimit: 100 }) {
    const page = Math.max(parseInt(query.page, 10) || defaults.page, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaults.limit, 1), defaults.maxLimit );
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}

function buildMeta({ page, limit, total }) {
    return { page, limit, total, totalPages: Math.ceil(total / limit) || 1};
}

module.exports = { getPagination, buildMeta };