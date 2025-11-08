from datetime import datetime,timedelta

def date_str(date) -> str:
    return date.strftime('%Y%m%d')

def datetime_str(time) -> str:
    return time.strftime('%Y%m%d%H%M%S')

def yesterday_date() -> datetime.date:
    return datetime.now().date()-timedelta(days=1)

def yesterday_date_str() -> str:
    return date_str(yesterday_date)