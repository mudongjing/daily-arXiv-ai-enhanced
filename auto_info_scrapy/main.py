"""
自动完成arxiv论文和telegram频道消息的抓取工作
并将抓取到的信息存储在指定的数据目录下
最后交由AI模块进行分析和总结，将结果存储在数据目录下
"""
from arxiv_scrapy import do_scrapy as do_arxiv_scrapy
from tele_channel_scrapy import do_scrapy as do_tele_channel_scrapy
import os
data_dir = os.path.abspath('../info_data')

def do_scrapy():    
    do_arxiv_scrapy(data_dir+'/arxiv_scrapy')
    do_tele_channel_scrapy(data_dir+'/tele_channel_scrapy')

if __name__ == '__main__':
    do_scrapy()