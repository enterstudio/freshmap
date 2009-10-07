from werkzeug import Response
from redfox import WebApplication, get, post
from urllib import urlopen

class EventsFeed(WebApplication):
    def __init__(self, global_config, feedurl, **local_config):
        self.feedurl = feedurl
    
    @get('/')
    def index(self, request):
        feed = urlopen(self.feedurl)
        response = Response(feed.read())
        response.headers['Content-type'] = 'application/json'
        return response