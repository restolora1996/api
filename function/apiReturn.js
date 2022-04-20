module.exports = ({
	all = false,
	count = false,
	data = [],
	isDistinct = false,
	limit = 50,
	offset = 0,
	page = 1,
	total = 0,
	totalResults = 0
}) => {
	let results = {};
	if (!all && !count) {
		results['start'] = page == 1 ? true : false;
		results['end'] = offset + limit >= totalResults ? true : false;
		results['currentPage'] = page;
		results['nextPage'] = results.end ? 0 : page + 1;
		results['totalPages'] = Math.ceil(totalResults / limit);
	}
	if (!count) results['data'] = [...data];
	if (!isDistinct) results['totalResults'] = totalResults;
	if (!isDistinct) results['total'] = total;
	return results;
};
