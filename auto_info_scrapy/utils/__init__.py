from datetime import datetime,timedelta

def date_str(d) -> str:
    return d.strftime('%Y%m%d')

def format_date(d) -> str:
    return d.strftime('%Y-%m-%d')

def datetime_str(t) -> str:
    return t.strftime('%Y%m%d%H%M%S')

def yesterday_date() -> datetime.date:
    return datetime.now().date()-timedelta(days=1)

def yesterday_date_str() -> str:
    return date_str(yesterday_date())