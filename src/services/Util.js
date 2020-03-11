const isValidOperation = (updates, allowedUpdates) => {
    return updates.every((update) => allowedUpdates.includes(update));
};

const getFromQuery = (query, key) => {
    if (query[key]) {
        return parseInt(query[key]);
    }
};

const getSortFromQuery = (query, key) => {
    const sort = {};
    if (query[key]) {
        const parts = query[key].split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }
    return sort;
};


const filterData = (queriesObject, allowedQueries) => {
    const queries = {};
    const queriesKeys = Object.keys((queriesObject));

    Object.values(queriesKeys).forEach((query) => {
        if (allowedQueries.includes(query)) {
            queries[query] = queriesObject[query];
        }
    });


    return {
        limit: getFromQuery(queriesObject, 'limit'),
        skip: getFromQuery(queriesObject, 'skip'),
        sort: getSortFromQuery(queriesObject, 'sortBy'),
        queries
    };
};

module.exports = {
    isValidOperation,
    filterData
};