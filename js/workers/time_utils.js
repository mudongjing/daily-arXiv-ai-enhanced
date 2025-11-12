
export function get_current_date(){
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
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

// date_keys 为日期字符串数组，先对其排序，current_date作为开始日期，end_date作为结束时间，从date_keys中选择距离该时间范围最远的日期
export function select_dates_to_remove(current_date, end_date,date_keys){
    date_keys.sort();
    let num_to_remove = date_keys.length - 5;// 保留附近5天的日期
    if(num_to_remove <= 0){
        return [];
    }
    let head = 0;
    let tail = date_keys.length - 1;
    let remove_keys = [];
    while(num_to_remove > 0){
        let delta_to_head = get_date_delta(new Date(date_keys[head]), current_date);
        let delta_to_tail = get_date_delta( end_date? end_date : current_date,new Date(date_keys[tail]));
        if(delta_to_head<=0 && delta_to_tail<=0){ // 已处于时间范围内，无需移除
            break;
        }
        if(delta_to_head<=0){ // 头指针已到时间范围左侧，移除尾指针日期
            remove_keys.push(date_keys[tail]);
            tail--;
            continue;
        }
        if(delta_to_tail<=0){ // 尾指针已到时间范围右侧，移除头指针日期
            remove_keys.push(date_keys[head]);
            head++;
            continue;
        }
        if(delta_to_head > delta_to_tail){
            remove_keys.push(date_keys[head]);
            head++;
        }else{
            remove_keys.push(date_keys[tail]);
            tail--;
        }
        num_to_remove--;
    }
    
    return remove_keys;
}

export function get_date_range_arr(start_date,end_date){
    let date_range_arr = [];
    let current_date = new Date(start_date);
    while(current_date <= end_date){
        date_range_arr.push(format_date(current_date));
        current_date = add_days(current_date, 1);
    }
    return date_range_arr;
}
