String.prototype.toDate = function() {
    try{
        if(!this)
            return null;

        let date = new Date(this);
        if (date == 'Invalid date') {
            return null;
        }

        return date;
    } catch (e) {
        return null;
    }
}