"""
自动抓取arxiv论文，按照指定的分类信息，获取前一天新提交的论文信息
并通过AI对摘要分析，如果论文术语纯理论性的，则保留，否则舍弃
最后，由AI对摘要总结几个关键词，作为论文的标签信息
"""

from . import scrapy_info
from ai_summary.arxiv_ai_summary import arxiv_ai_summary

def do_scrapy(data_dir: str):
    # scrapy_info.scrapy_info(data_dir)
    #     arxiv_ai_summary(data_dir)
    arxiv_ai_summary(data_dir)
