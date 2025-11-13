
import * as initer from './workers/init.js';
import * as loader from './workers/load_resource.js';
import * as renderer from './workers/render_result.js';
import * as const_key from './workers/const_key.js';
/**
 * 初始化事件监听器
 * 获取已有的主分类的选择，以及内部的子分类的选择。对其中的分类若不存在则使用默认值
 * 读取当前的日期，放在window.globalData中
 * 利用日期加载所有主分类的指定日期的相关文件，获取个主分类的消息数量，并渲染主分类的标签栏
 * [ 获取主分类的数量信息，和渲染标签栏为一个整体函数，用于后期用户主动选择日期时，进行实时渲染 ]
 * 
 * 完成了主分类标签栏的渲染后，对主分类的文件读取信息，加载格式化数据，利用统计信息完成对子分类的标签栏的渲染
 * 利用之前关于子分类的选择，从格式化信息中提取相关的子分类的信息，渲染主体内容
 * 
 * [关于数据的加载和存储
 *  ——window.globalData存储一个字典，键为日期，值为一个字典，键为主分类，值为该主分类的格式化数据
 *  ——每个主分类的格式化数据存储一个字典，键为标志名，目前为'data':存储该主分类的所有格式化数据
 *                                                 'sub_cat':内部为字典，键为子分类，值为内部数据的索引值数组，索引为该子分类在'data'中的位置
 *                                                 'keywords':内部为字典，键为关键词，值为内部数据的索引值数组，索引为该关键词在'data'中的位置
 *                                                 'matched_index':数组格式，用于使用关键词搜索或全文搜索时，在内部完成搜索，存储所有匹配的索引值，用于后续的渲染
 * 
 *  * 在渲染时，对数据采用懒加载的方式，主分类在需要渲染时，先检查是否存在对应的格式化数据，若不存在则加载该主分类的格式化数据
 *  * 对于数据的存储保留附近最大5天的数据
 *                                  如果用户跳着选择日期，只要总的加载的日期不超过5天，则不会删除
 *                                  如果用户当前加载的日期超过5天，则删除距离此时选择的日期最远的那一天的数据
 *                                  但是，当用户指定一个时间范围时，且存在的日期数量超过5，如果存在范围之外的日期数据，则删除一个距离最远的日期数据
 * ]
 * 
 * 考虑到之后抓取新闻时，对应的数据量非常巨大，对内容的加载使用虚拟列表的方式，只加载当前可见区域的内容，避免一次性加载所有数据导致性能问题
 * 也导致搜索时，当前页面无法给出完整的搜索结果，需要在后台利用完整数据进行匹配，匹配完成后，将匹配的索引值存储在'matched_index'中，用于后续的渲染
 */
var handlers = {};// 利用流水线模式，对不同阶段执行对应的函数
handlers[const_key.global_data_key] = {
  [const_key.force_refresh_key]: true,
  [const_key.info_data_dir_key]: './info_data/',
  [const_key.is_fetch_complete_key]: false,
  [const_key.current_view_key]: 'grid',
};

handlers[const_key.init_key] = {};
initer.add_workers_with_data(handlers);
handlers[const_key.load_resource_key] = {};
loader.add_workers_with_data(handlers);
handlers[const_key.render_key] = {};
renderer.add_workers_with_data(handlers);

const handle_workers = async function(worker_name){
  var workers_with_data = handlers[worker_name];
  if(workers_with_data){
    var workers = workers_with_data[const_key.workers_key];
    for(let worker of workers){
      if(isAsyncFunction(worker)){
        await worker(handlers);
      } else{
        worker(handlers);
      }
    }
  }
}


document.addEventListener('DOMContentLoaded', async () => {
  handle_workers(const_key.init_key);//初始化
  fetchGitHubStats();
  await handle_workers(const_key.load_resource_key);//加载资源
  handle_workers(const_key.render_key);//渲染结果
});

async function fetchGitHubStats() {
  try {
    const response = await fetch('https://api.github.com/repos/dw-dengwei/daily-arXiv-ai-enhanced');
    const data = await response.json();
    const starCount = data.stargazers_count;
    const forkCount = data.forks_count;
    
    document.getElementById('starCount').textContent = starCount;
    document.getElementById('forkCount').textContent = forkCount;
  } catch (error) {
    console.error('获取GitHub统计数据失败:', error);
    document.getElementById('starCount').textContent = '?';
    document.getElementById('forkCount').textContent = '?';
  }
}

function isAsyncFunction(fn) {
  return Object.prototype.toString.call(fn) === '[object AsyncFunction]';
}