import * as const_key from './const_key.js';
import { format_date } from './time_utils.js';

const key = const_key.render_key;

export function add_workers_with_data(handlers){
    // 过滤子分类，过滤日期，过滤关键词，过滤作者
    handlers[key][const_key.data_key] = {};
    let workers = [];
    handlers[key][const_key.workers_key] = workers;
    workers.push(filter_main_category);// 检查当前局部的主分类是否与全局活跃的主分类匹配，不匹配则设置局部的强制刷新，或者全局为强制刷新也更新局部的强制刷新
    workers.push(filter_date); // 同样检查强制刷新，或日期不匹配时，更新局部的索引列表
    workers.push(filter_sub_category); // 检查是否有强制刷新，或者局部的次分类是否与全局活跃的次分类不匹配，重新读取主分类原始数据，更新局部的索引列表
    workers.push(filter_keywords); // 类似的，更新局部的索引列表
    workers.push(filter_author); // 诸如上述的关键词，如果没有设置，则表示不做过滤，复制前一步的索引列表
    workers.push(search_query); // 检查是否有文本搜索查询，搜索默认对标题和摘要进行搜索，使用&& 隔离，可同时指定搜索作者，关键词。没有则复制前一步的索引列表，有则添加标记说明
    workers.push(render_result); // 利用前一步的索引列表，读取主分类的原始数据，并结合主分类的情况，有主分类对应的渲染器，完成渲染，搜索结果使用特殊格式渲染
}

function filter_main_category(handlers){
    let data = handlers[key][const_key.data_key];
    if(handlers[const_key.global_data_key][const_key.force_refresh_key]){
        data[const_key.force_refresh_key] = true;
        data[const_key.main_category_key] = handlers[const_key.global_data_key][const_key.main_category_key];
    }else{
        if(data[const_key.main_category_key] !== handlers[const_key.global_data_key][const_key.main_category_key]){
            data[const_key.force_refresh_key] = true;
            data[const_key.main_category_key] = handlers[const_key.global_data_key][const_key.main_category_key];
        }
    }
}

function filter_date(handlers){
    let data = handlers[key][const_key.data_key];
    let global_start_date = handlers[key][const_key.current_date_key];
    let global_end_date = handlers[const_key.global_data_key][const_key.end_date_key];
    if(data[const_key.force_refresh_key] || data[const_key.current_date_key] !== global_start_date || data[const_key.end_date_key] !== global_end_date){
        data[const_key.force_refresh_key] = true;
        data[const_key.current_date_key] = global_start_date;
        data[const_key.end_date_key] = global_end_date;
        if(!global_end_date){
            data[const_key.date_index_arr_key] = [format_date(global_start_date)];
        }else{
            data[const_key.date_index_arr_key] = get_date_range_arr(global_start_date, global_end_date);
        }
    }
}

function filter_sub_category(handlers){
    let data = handlers[key][const_key.data_key];
    let local_sub_category = handlers[key][const_key.sub_category_key];
    if(data[const_key.force_refresh_key] || local_sub_category !== handlers[const_key.global_data_key][const_key.sub_category_key]){
        data[const_key.force_refresh_key] = true;
        data[const_key.sub_category_key] = handlers[const_key.global_data_key][const_key.sub_category_key];
        let now_sub_category = data[const_key.sub_category_key];
        const now_main_category = data[const_key.main_category_key];
        const date_index_arr = data[const_key.date_index_arr_key];
        const source_data = handlers[const_key.load_resource_key][const_key.data_key][now_main_category];
        if(now_sub_category===const_key.all_sign){
            data[const_key.sub_category_index_dict_key] = date_index_arr.reduce((dict, date) => {
                dict[date] = range(source_data[date][const_key.source_data_key].length);
                return dict;
            }, {});
        }else{
            data[const_key.sub_category_index_dict_key] = date_index_arr.reduce((dict, date) => {
                dict[date] = source_data[date][const_key.category_index_key][now_sub_category] || [];
                return dict;
            }, {});
        }
    }
    
}

function filter_keywords(handlers){
    let data = handlers[key][const_key.data_key];
    let local_keywords = handlers[key][const_key.active_keywords_key];
    let global_keywords = handlers[const_key.global_data_key][const_key.active_keywords_key];
    const now_main_category = data[const_key.main_category_key];
    if(data[const_key.force_refresh_key] || !is_arr_same(local_keywords, global_keywords)){
        data[const_key.force_refresh_key] = true;
        data[const_key.active_keywords_key] = global_keywords;
        const sub_category_index_dict = data[const_key.sub_category_index_dict_key];
        if(!global_keywords || global_keywords.length === 0){
            data[const_key.keywords_index_dict_key] = deep_clone(sub_category_index_dict);
        }else{
            let keywords_index_dict = {};
            const source_data = handlers[const_key.load_resource_key][const_key.data_key][now_main_category];
            const date_index_arr = data[const_key.date_index_arr_key];
            date_index_arr.forEach(date => {
                let arrs = [];
                arrs.push(sub_category_index_dict[date]);
                for(let key_word of global_keywords){
                    arrs.push(source_data[date][const_key.keyword_index_key][key_word] || []);
                }
                keywords_index_dict[date] = intersection(arrs);
            });
            data[const_key.keywords_index_dict_key] = keywords_index_dict;
        }
    }
}

function filter_author(handlers){
    let data = handlers[key][const_key.data_key];
    let local_authors = data[const_key.active_authors_key];
    let global_authors = handlers[const_key.global_data_key][const_key.active_authors_key];
    if(data[const_key.force_refresh_key] || !is_arr_same(local_authors, global_authors)){
        data[const_key.force_refresh_key] = true;
        data[const_key.active_authors_key] = global_authors;
        const now_main_category = data[const_key.main_category_key];
        const date_index_arr = data[const_key.date_index_arr_key];
        const keywords_index_dict = data[const_key.keywords_index_dict_key];
        if(!global_authors || global_authors.length === 0){
            data[const_key.authors_index_dict_key] = deep_clone(keywords_index_dict);
        }else{
            let authors_index_dict = {};
            const source_data = handlers[const_key.load_resource_key][const_key.data_key][now_main_category];
            date_index_arr.forEach(date => {
                let arrs = [];
                arrs.push(keywords_index_dict[date]);
                for(let author of global_authors){
                    arrs.push(source_data[date][const_key.author_index_key][author] || []);
                }
                authors_index_dict[date] = intersection(arrs);
            });
            data[const_key.authors_index_dict_key] = authors_index_dict;
        }
    }
}

function search_query(handlers){
    let data = handlers[key][const_key.data_key];
    let query = handlers[const_key.global_data_key][const_key.text_search_query_key];
    if (!query || query.trim() === ''){
        data[const_key.search_result_key] = deep_clone(data[const_key.authors_index_dict_key]);
    } else{
        let query_parts = query.split('&&');
        let title_or_summary_query = [];
        let authors_query = [];
        let keywords_query = [];
        let sub_category_query = [];
        for(let query_part of query_parts){
            query_part = query_part.trim();
            if(query_part === ''){
                continue;
            }
            if(query_part.startsWith('author:')){
                let query = query_part.substring('author:'.length);
                if(!authors_query.includes(query)){
                    authors_query.push(query);
                }
            }else if(query_part.startsWith('keyword:')){
                let query = query_part.substring('keyword:'.length);
                if(!keywords_query.includes(query)){
                    keywords_query.push(query);
                }
            }else if(query_part.startsWith('sub_category:')){
                let query = query_part.substring('sub_category:'.length);
                if(!sub_category_query.includes(query)){
                    sub_category_query.push(query);
                }
            }else{
                if(!title_or_summary_query.includes(query_part)){
                    title_or_summary_query.push(query_part);    
                }
            }
        }
    }
    
    handlers[const_key.global_data_key][const_key.text_search_query_key] = null;
}



function render_result(handlers){
    let data = handlers[key][const_key.data_key];
    let html = '';
    data.forEach(item => {
        html += `<div class="result-item">
            <h3>${item.title}</h3>
            <p>${item.abstract}</p>
            <p>分类: ${item.main_category} ${item.sub_categories.join(', ')}</p>
            <p>日期: ${item.date}</p>
            <p>关键词: ${item.keywords.join(', ')}</p>
            <p>作者: ${item.authors.join(', ')}</p>
        </div>`;
    });
    document.getElementById('result-container').innerHTML = html;
}

function range(n){
    return Array.from({ length: n }, (_, i) => i);
}

function is_arr_same(arr1,arr2){
    if(!arr1 && !arr2){
        return true;
    }
    if(arr1.length !== arr2.length){
        return false;
    }
    arr1 = arr1.sort((a,b)=>a-b);
    arr2 = arr2.sort((a,b)=>a-b);
    for(let i=0;i<arr1.length;i++){
        if(arr1[i] !== arr2[i]){
            return false;
        }
    }
    return true;
}

function deep_clone(obj){
    return _.cloneDeep(obj);
}

// arrs 保存多个数组，返回它们的交集
function intersection(arrs) {
    return arrs.reduce((acc, cur) => _.intersection(acc, cur));
}