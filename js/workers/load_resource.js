import * as const_key from './const_key.js';
import * as time_utils from './time_utils.js';

const key = const_key.load_resource_key;

export function add_workers_with_data(handlers){
    let workers = [];
    handlers[key] = {
        'data': {},
        'workers': workers
    }
    workers.push(load_main_category);
    workers.push(load_sub_category);
    workers.push(load_date_range);
    workers.push(load_authors);
    workers.push(load_keywords);
    workers.push(load_info_data);
}

function load_main_category(handlers){
    if(handlers[const_key.global_data_key][const_key.force_refresh_key]){
        handlers[const_key.global_data_key][const_key.main_category_key] = localStorage.getItem(const_key.main_category_key) || '';
    }
}

// 子分类的格式为按逗号分隔的数组
function load_sub_category(handlers){
    if(!handlers[const_key.global_data_key][const_key.force_refresh_key]){
        return;
    }
    let sub_category = localStorage.getItem(const_key.sub_category_key);
    let arr = [];
    if(sub_category){
        arr = sub_category.split(',');
    }
    handlers[const_key.global_data_key][const_key.sub_category_key] = arr;
}

function load_date_range(handlers){
    if(!handlers[const_key.global_data_key][const_key.force_refresh_key]){
        return;
    }
    let current_date = time_utils.get_current_date();
    handlers[const_key.global_data_key][const_key.current_date_key] = current_date;
    handlers[const_key.global_data_key][const_key.end_date_key] = null;
}

function load_authors(handlers){
    if(!handlers[const_key.global_data_key][const_key.force_refresh_key]){
        return;
    }
    let active_authors = localStorage.getItem(const_key.active_authors_key);
    let arr = [];
    if(active_authors){
        arr = active_authors.split(',');
    }
    handlers[const_key.global_data_key][const_key.active_authors_key] = arr;
}

function load_keywords(handlers){
    if(!handlers[const_key.global_data_key][const_key.force_refresh_key]){
        return;
    }
    let active_keywords = localStorage.getItem(const_key.active_keywords_key);
    let arr = [];
    if(active_keywords){
        arr = active_keywords.split(',');
    }
    handlers[const_key.global_data_key][const_key.active_keywords_key] = arr;
}

function load_info_data(handlers){
    let current_date = handlers[const_key.global_data_key][const_key.current_date_key];
    let end_date = handlers[const_key.global_data_key][const_key.end_date_key];
    let delta = end_date ? time_utils.get_date_delta(current_date, end_date) : 0;
    let data = handlers[key]['data'];
    for(let info_key of const_key.info_source_key){
        
    }
}