import * as const_key from './const_key.js';
import * as time_utils from './time_utils.js';

const key = const_key.load_resource_key;

export function add_workers_with_data(handlers){
    let workers = [];
    handlers[key][const_key.data_key] = {};
    handlers[key][const_key.workers_key] = workers;
    workers.push(load_main_category);
    workers.push(load_sub_category);
    workers.push(load_date_range);
    workers.push(load_authors);
    workers.push(load_keywords);
    workers.push(load_info_data);
}

function load_main_category(handlers){
    if(handlers[const_key.global_data_key][const_key.force_refresh_key]){
        handlers[const_key.global_data_key][const_key.main_category_key] = localStorage.getItem(const_key.main_category_key) || const_key.info_source_key[0];
        localStorage.setItem(const_key.main_category_key, handlers[const_key.global_data_key][const_key.main_category_key]);
    }
}

// 子分类的格式为按逗号分隔的数组
function load_sub_category(handlers){
    if(!handlers[const_key.global_data_key][const_key.force_refresh_key]){
        return;
    }
    let sub_category = localStorage.getItem(const_key.sub_category_key)||const_key.all_sign;
    let arr = [];
    if(sub_category){
        arr = sub_category.split(',');
    }
    handlers[const_key.global_data_key][const_key.sub_category_key] = arr;
}

function load_date_range(handlers){
    if(!handlers[const_key.global_data_key][const_key.flatpickrInstance_key]){
        const datepickerInput = document.getElementById('datepicker');
        handlers[const_key.global_data_key][const_key.flatpickrInstance_key] = flatpickr(datepickerInput, {
            inline: true,
            dateFormat: "Y-m-d",
            defaultDate: time_utils.get_current_date(),
            enable: [
            function(date) {
                // 只启用有效日期
                const dateStr = date.getFullYear() + "-" +
                                String(date.getMonth() + 1).padStart(2, '0') + "-" +
                                String(date.getDate()).padStart(2, '0');
                // 在 availableDates[0] 之后的日期全部返回 false，否则返回 true
                return dateStr <= time_utils.format_date(time_utils.get_current_date());
            }
            ],
            onChange: function(selectedDates, dateStr) {
                const isRangeMode = handlers[const_key.global_data_key][const_key.is_range_mode_key];
                if (isRangeMode && selectedDates.length === 2) {
                    // 处理日期范围选择
                    // const startDate = time_utils.format_date(selectedDates[0]);
                    // const endDate = time_utils.format_date(selectedDates[1]);
                    handlers[const_key.global_data_key][const_key.current_date_key] = selectedDates[0];
                    handlers[const_key.global_data_key][const_key.end_date_key] = selectedDates[1];
                    // loadPapersByDateRange(startDate, endDate);
                    // toggleDatePicker(handlers);
                } else if (!isRangeMode && selectedDates.length === 1) {
                    // 处理单个日期选择
                    // const selectedDate = time_utils.format_date(selectedDates[0]);
                    handlers[const_key.global_data_key][const_key.current_date_key] = selectedDates[0];
                    handlers[const_key.global_data_key][const_key.end_date_key] = null;
                    // if (availableDates.includes(selectedDate)) {
                    // loadPapersByDate(selectedDate);
                    // toggleDatePicker(handlers);
                    // }
                }
                console.log('日期选择',selectedDates,handlers[const_key.global_data_key][const_key.current_date_key],handlers[const_key.global_data_key][const_key.end_date_key]);
                handlers[const_key.global_data_key][const_key.force_refresh_key] = true;
                const_key.refresh_render();
                toggleDatePicker(handlers);
            }
        });
    }
    if(!handlers[const_key.global_data_key][const_key.force_refresh_key] || !handlers[const_key.global_data_key][const_key.is_first_load_key]){
        return;
    }
    let current_date = time_utils.get_current_date();
    handlers[const_key.global_data_key][const_key.current_date_key] = current_date;
    handlers[const_key.global_data_key][const_key.end_date_key] = null;
    handlers[const_key.global_data_key][const_key.is_first_load_key] = false;
}

function toggleDatePicker(handlers) {
  const datePicker = document.getElementById('datePickerModal');
  datePicker.classList.toggle('active');
  
  if (datePicker.classList.contains('active')) {
    document.body.style.overflow = 'hidden';
    
    // 重新初始化日期选择器以确保它反映最新的可用日期
    const currentDate = handlers[const_key.global_data_key][const_key.current_date_key];
    const flatpickrInstance = handlers[const_key.global_data_key][const_key.flatpickrInstance_key];
    if (flatpickrInstance) {
      flatpickrInstance.setDate(time_utils.format_date(currentDate), false);
    }
  } else {
    document.body.style.overflow = '';
  }
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

async function load_info_data(handlers){
    let current_date = handlers[const_key.global_data_key][const_key.current_date_key];
    let end_date = handlers[const_key.global_data_key][const_key.end_date_key];
    let delta = end_date ? time_utils.get_date_delta(current_date, end_date) : 0;
    let data = handlers[key][const_key.data_key];
    for(let info_key of const_key.info_source_key){
        let info_data = data[info_key];
        if(!info_data){
            data[info_key] = {};
            info_data = data[info_key];
        }else{
            let date_keys = Object.keys(info_data);
            let remove_keys = time_utils.select_dates_to_remove( current_date, end_date,date_keys);
            for(let key of remove_keys){
                delete info_data[key];
            }
        }
        for(let i =0;i<= delta;i++){
            let target_date = time_utils.add_days(current_date, i);
            let date_str = time_utils.format_date(target_date);
            if(!info_data[date_str]){
                let [source_data, author_index, category_index, keyword_index] = await read_info_file(info_key, date_str,handlers);
                info_data[date_str] = {
                    [const_key.source_data_key]: source_data,
                    [const_key.author_index_key]: author_index,
                    [const_key.category_index_key]: category_index,
                    [const_key.keyword_index_key]: keyword_index
                };
            }
        }
    }
    console.log('加载数据',data);
}

async function read_info_file(info_key, date_str,handlers){
    let data_dir = handlers[const_key.global_data_key][const_key.info_data_dir_key];
    let file_path = `${data_dir}${info_key}_scrapy/${date_str}_ai_${info_key}.jsonl`;
    let source_data = [];
    let author_index = {};
    let category_index = {};
    let keyword_index = {};
    try {
        const response = await fetch(file_path);
        if (!response.ok) {
            return [source_data, author_index, category_index, keyword_index];
        }
        const text = await response.text();
        if (!text || text.trim() === '') {
            return [source_data, author_index, category_index, keyword_index];
        }
        [source_data, author_index, category_index, keyword_index] = parseJsonlData(text);
    } catch (error) {
        // console.error(`Error loading file ${file_path}:`, error);
        // return [source_data, author_index, category_index, keyword_index];
    }
    return [source_data, author_index, category_index, keyword_index];
}

function parseJsonlData(jsonlText) {
  let source_data = [];
  let author_index = {};
  let category_index = {};
  let keyword_index = {};

  const lines = jsonlText.trim().split('\n');
  let index = 0;
  lines.forEach(line => {
    try {
      let paper = JSON.parse(line);
      source_data.push(paper);
      make_index(paper.authors,author_index,index);
      make_index(paper.categories,category_index,index);
      make_index(paper.keywords,keyword_index,index);
      index++;
    } catch (error) {
      console.error('解析JSON行失败:', error, line);
    }
  });
  
  return [source_data, author_index, category_index, keyword_index];
}

function make_index(keys,map,index){
    if(keys){
        for(let key of keys){
            if(!map[key]){
                map[key] = [];
            }
            map[key].push(index);
        }
    }
}