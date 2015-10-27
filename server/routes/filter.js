exports.filters = function(page,pagesize,json,cb){
    var current = page * pagesize;
    var items = json || [];
    var totallist = items.length;
    items = items.slice(current,current+pagesize);
    var totalPages = Math.ceil(totallist / pagesize);
    cb(items,totalPages);
};