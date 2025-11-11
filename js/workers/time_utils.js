
export function get_current_date(){
    return new Date();
}

export function add_days(date, days){
    let new_date = new Date(date);
    new_date.setDate(new_date.getDate() + days);
    return new_date;
}

export function format_date(date){
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    return `${year}-${month}-${day}`;
}

export function get_date_delta(current_date, end_date){
    let delta = end_date - current_date;
    return (delta / (1000 * 60 * 60 * 24)) | 0;
}
