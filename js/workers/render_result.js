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

function render_date(start_date,end_date){
    if(end_date){
        document.getElementById('currentDate').textContent = format_date(start_date)+' - '+format_date(end_date);    
    }else{
        document.getElementById('currentDate').textContent = format_date(start_date);    
    }
}

function filter_date(handlers){
    let data = handlers[key][const_key.data_key];
    let global_start_date = handlers[const_key.global_data_key][const_key.current_date_key];
    let global_end_date = handlers[const_key.global_data_key][const_key.end_date_key];
    if(data[const_key.force_refresh_key] || data[const_key.current_date_key] !== global_start_date || data[const_key.end_date_key] !== global_end_date){
        data[const_key.force_refresh_key] = true;
        data[const_key.current_date_key] = global_start_date;
        data[const_key.end_date_key] = global_end_date;
        render_date(global_start_date, global_end_date);
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
        if(now_sub_category.includes(const_key.all_sign)){
            data[const_key.sub_category_index_dict_key] = date_index_arr.reduce((dict, date) => {
                dict[date] = range(source_data[date][const_key.source_data_key].length);
                return dict;
            }, {});
        }else{
            data[const_key.sub_category_index_dict_key] = date_index_arr.reduce((dict, date) => {
                let arrs = [];
                for(let sub_category of now_sub_category){
                    arrs.push(source_data[date][const_key.category_index_key][sub_category] || []);
                }
                dict[date] = union(arrs);
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
    if(data[const_key.force_refresh_key] || !const_key.is_arr_same(local_keywords, global_keywords)){
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
    if(data[const_key.force_refresh_key] || !const_key.is_arr_same(local_authors, global_authors)){
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
    const index_dict = data[const_key.authors_index_dict_key];
    const now_sub_category = data[const_key.sub_category_key];
    const now_main_category = data[const_key.main_category_key];
    if (!query || query.trim() === ''){
        data[const_key.query_result_index_dict_key] = deep_clone(index_dict);
    } else{
        let query_parts = query.split('&&');
        let title_or_summary_query = [];
        let authors_query = [];
        let keywords_query = [];
        let sub_category_query = [];
        handlers[const_key.global_data_key][const_key.title_or_summary_query_key] = title_or_summary_query;
        handlers[const_key.global_data_key][const_key.authors_query_key] = authors_query;
        handlers[const_key.global_data_key][const_key.keywords_query_key] = keywords_query;
        handlers[const_key.global_data_key][const_key.sub_category_query_key] = sub_category_query;
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
        
        // 如果上述查询内容为空，或者查询的子类与当前活跃的相同，则不执行实际搜索，直接复制原有的索引字典
        // 利用现有的索引字典，按日期逐个,先获取原始的索引列表，与对应的查询的作者的索引列表取交集，得到新的索引列表，如果作者不要求查询，则使用原始索引列表
        // 类似地，对关键词和子类进行处理，不断利用前一步得到的新索引列表，与查询要求的内容对应的索引列表取交集
        // 最后，利用最后的索引列表，去查询对应的原始数据，查询其标题和摘要是否有 title_or_summary_query 中的内容
        // 如果有，在新的索引列表中加入该数据对应的索引
        if(authors_query.length === 0 && keywords_query.length === 0  && title_or_summary_query.length === 0 && (sub_category_query.length === 0 || (sub_category_query.length === 1 && sub_category_query[0] === now_sub_category))){
            data[const_key.query_result_index_dict_key] = deep_clone(index_dict);
            data[const_key.is_query_key] = sub_category_query.length === 1 ;
        }else{
            let query_result_index_dict = {};
            const date_index_arr = data[const_key.date_index_arr_key];
            const source_data = handlers[const_key.load_resource_key][const_key.data_key][now_main_category];
            date_index_arr.forEach(date => {
                let arrs = [];
                arrs.push(index_dict[date]);
                for(let author of authors_query){
                    arrs.push(source_data[date][const_key.author_index_key][author] || []);
                }
                for(let keyword of keywords_query){
                    arrs.push(source_data[date][const_key.keyword_index_key][keyword] || []);
                }
                for(let sub_category of sub_category_query){
                    arrs.push(source_data[date][const_key.sub_category_index_dict_key][sub_category] || []);
                }
                let tmp_index = intersection(arrs);
                if(tmp_index.length === 0){
                    query_result_index_dict[date] = tmp_index;
                }else{
                    query_result_index_dict[date] = tmp_index.filter(index => {
                        let item = source_data[date][const_key.source_data_key][index];
                        return title_or_summary_query.some(query => item.title.includes(query) || item.summary.includes(query));
                    });
                }
                
            });
            data[const_key.query_result_index_dict_key] = query_result_index_dict;
            data[const_key.is_query_key] = true ;
        }
    }
    let total_paper_num = 0;
    let query_result_index_dict = data[const_key.query_result_index_dict_key];
    for(let date in query_result_index_dict){
        total_paper_num += query_result_index_dict[date].length;
    }
    data[const_key.total_paper_num_key] = total_paper_num;
    handlers[const_key.global_data_key][const_key.text_search_query_key] = null;
}



function render_result(handlers){
    const data = handlers[key][const_key.data_key];
    const query_result_index_dict = data[const_key.query_result_index_dict_key];
    const container = document.getElementById('paperContainer');
    const now_main_category = data[const_key.main_category_key];
    const source_data = handlers[const_key.load_resource_key][const_key.data_key][now_main_category];
    container.innerHTML = '';
    let current_view = handlers[const_key.global_data_key][const_key.current_view_key];
    container.className = `paper-container ${current_view === 'list' ? 'list-view' : ''}`;
    let is_matched = data[const_key.is_query_key];

    let local_index = 1; // 用于显示论文的本地序号
    let date_index = 0; // 用于显示论文的日期序号
    let paper_index_in_date = 0; // 用于显示论文在日期内的序号
    
    const sub_category_query = handlers[const_key.global_data_key][const_key.sub_category_query_key];
    for(let date in query_result_index_dict){
        let index_arr = query_result_index_dict[date];
        if(index_arr.length === 0){
            continue;
        }
        for(let index of index_arr){
            const paper = source_data[date][const_key.source_data_key][index];
            const paperCard = document.createElement('div');
            // 添加匹配高亮类
            paperCard.className = `paper-card ${is_matched ? 'matched-paper' : ''}`;
            paperCard.dataset.id = paper.id || paper.url;
            
            const categoryTags = is_matched && sub_category_query.length > 0 ? paper.categories.map(cat => 
                            sub_category_query.includes(cat)?  `<span class="category-tag keyword-highlight">${cat}</span>`:`<span class="category-tag">${cat}</span>`).join('') 
                    :paper.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('') ;

            // // 高亮标题和摘要（关键词与文本搜索）
            const highlightedTitle =  is_matched ? const_key.highlightMatches(paper.title, handlers[const_key.global_data_key][const_key.title_or_summary_query_key],'keyword-highlight') : paper.title;
            const highlightedSummary =  is_matched ? const_key.highlightMatches(paper.summary, handlers[const_key.global_data_key][const_key.title_or_summary_query_key],'keyword-highlight') : paper.summary;
            const highlightedAuthors = is_matched ? const_key.highlightWithIn(paper.authors, handlers[const_key.global_data_key][const_key.authors_query_key],'author-highlight') : paper.authors.join(', ');
            
            paperCard.innerHTML = `
                <div class="paper-card-index">${local_index}</div>
                // ${paper.isMatched ? '<div class="match-badge" title="匹配您的搜索条件"></div>' : ''}
                <div class="paper-card-header">
                    <h3 class="paper-card-title">${highlightedTitle}</h3>
                    <p class="paper-card-authors">${highlightedAuthors}</p>
                    <div class="paper-card-categories">
                    ${categoryTags}
                    </div>
                </div>
                <div class="paper-card-body">
                    <p class="paper-card-summary">${highlightedSummary}</p>
                    <div class="paper-card-footer">
                    <span class="paper-card-date">${paper.submitted_date}</span>
                    <span class="paper-card-link">Details</span>
                    </div>
                </div>
            `;
            let paper_wrapper = new const_key.PaperWrapper(paper,date_index,paper_index_in_date,local_index);
            
            paperCard.addEventListener('click', () => {
                handlers[const_key.global_data_key][const_key.current_paper_date_index_key] = paper_wrapper.date_index;
                handlers[const_key.global_data_key][const_key.current_paper_index_key] = paper_wrapper.paper_index_in_date; // 记录当前点击的论文索引
                handlers[const_key.global_data_key][const_key.paper_local_index_key] = paper_wrapper.local_index; // 记录当前点击的论文本地索引
                const_key.showPaperDetails(paper_wrapper);
            });
            
            container.appendChild(paperCard);
            paper_index_in_date = paper_index_in_date + 1;
            local_index++;
        }
        date_index = date_index+ 1;
    }
    if(local_index === 1){
        container.innerHTML = `
            <div class="loading-container">
                <p>No paper found.</p>
            </div>
        `;
    }
    handlers[const_key.global_data_key][const_key.force_refresh_key] = false;
    
}



function range(n){
    return Array.from({ length: n }, (_, i) => i);
}



function deep_clone(obj){
    return _.cloneDeep(obj);
}

// arrs 保存多个数组，返回它们的交集
function intersection(arrs) {
    return arrs.reduce((acc, cur) => _.intersection(acc, cur));
}

function union(arrs){
    return arrs.reduce((acc, cur) => _.union(acc, cur));
}